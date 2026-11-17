import { timingSafeEqual } from "node:crypto";

/** Fail closed: missing configuration is not anonymous authorization. */
export function authorizeBrainKey(expected: string, supplied: string | undefined): "authorized" | "unauthorized" | "misconfigured" {
  if (!expected.trim()) return "misconfigured";
  if (!supplied) return "unauthorized";
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(supplied, "utf8");
  return a.length === b.length && timingSafeEqual(a, b) ? "authorized" : "unauthorized";
}
