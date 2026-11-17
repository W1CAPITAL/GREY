import { test } from "node:test";
import { strict as assert } from "node:assert";
import { authorizeBrainKey } from "../src/lib/auth.js";

test("missing key must never authorize protected routes", () => {
  assert.equal(authorizeBrainKey("", undefined), "misconfigured");
  assert.equal(authorizeBrainKey(" ", "x"), "misconfigured");
});
test("invalid or absent credentials are refused", () => {
  assert.equal(authorizeBrainKey("test-secret", undefined), "unauthorized");
  assert.equal(authorizeBrainKey("test-secret", "invalid"), "unauthorized");
  assert.equal(authorizeBrainKey("test-secret", "test-secret-extra"), "unauthorized");
});
test("correct credentials authorize", () => {
  assert.equal(authorizeBrainKey("test-secret", "test-secret"), "authorized");
});
