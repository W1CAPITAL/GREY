import { test } from "node:test";
import { strict as assert } from "node:assert";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";

async function withServer(key: string, run: (base: string) => Promise<void>) {
  const reservation = createServer().listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>((resolve) => reservation.close(() => resolve()));
  const child = spawn(process.execPath, ["--import", "tsx", "src/server.ts"], {
    cwd: new URL("../", import.meta.url),
    env: { ...process.env, PORT: String(port), BRAIN_API_KEY: key, BRAIN_ALLOWED_ORIGINS: "https://allowed.example" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const closed = once(child, "close");
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Server startup timed out")), 10000);
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      child.once("exit", () => { clearTimeout(timer); reject(new Error("Server exited during startup")); });
      child.stdout.on("data", (data) => {
        if (String(data).includes("[lexis-brain")) { clearTimeout(timer); resolve(); }
      });
    });
    await run(`http://127.0.0.1:${port}`);
  } finally {
    child.kill();
    await closed;
  }
}

test("HTTP routes fail closed without a configured key", async () => {
  await withServer(" ", async (base) => {
    for (const path of ["/v1/skills", "/health"]) {
      const response = await fetch(base + path, { headers: { "x-brain-key": "synthetic-key" } });
      assert.equal(response.status, 503);
    }
  });
});

test("HTTP accepts scoped credentials and restricts browser origins", async () => {
  await withServer("synthetic-key", async (base) => {
    for (const headers of [{}, { authorization: "Bearer wrong" }, { authorization: "synthetic-key" }]) {
      assert.equal((await fetch(base + "/v1/skills", { headers })).status, 401);
    }
    for (const headers of [{ "x-brain-key": "synthetic-key" }, { authorization: "Bearer synthetic-key" }, { authorization: "bearer\tsynthetic-key" }]) {
      assert.equal((await fetch(base + "/v1/skills", { headers })).status, 200);
    }
    for (const origin of ["https://allowed.example", "https://untrusted.example"]) {
      const response = await fetch(base + "/v1/skills", { headers: { origin, authorization: "Bearer synthetic-key" } });
      assert.equal(response.headers.get("access-control-allow-origin"), origin.includes("untrusted") ? null : origin);
    }
    const classification = await fetch(base + "/v1/classify-status", {
      method: "POST", headers: { authorization: "Bearer synthetic-key", "content-type": "application/json" }, body: "{}",
    });
    assert.equal(classification.status, 200);
  });
});
