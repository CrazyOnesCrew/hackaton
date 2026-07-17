import { afterEach, describe, expect, it } from "vitest";
import { withBasePath } from "./base-path";

describe("withBasePath", () => {
  const original = process.env.NEXT_BASE_PATH;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_BASE_PATH;
    } else {
      process.env.NEXT_BASE_PATH = original;
    }
  });

  it("returns the path unchanged when NEXT_BASE_PATH is unset", () => {
    delete process.env.NEXT_BASE_PATH;
    expect(withBasePath("/api/auth/login")).toBe("/api/auth/login");
  });

  it("prefixes absolute paths with the configured basePath", () => {
    process.env.NEXT_BASE_PATH = "/portal";
    expect(withBasePath("/api/auth/me")).toBe("/portal/api/auth/me");
    expect(withBasePath("/examples/file.xml")).toBe("/portal/examples/file.xml");
  });

  it("does not double-prefix when the path already includes basePath", () => {
    process.env.NEXT_BASE_PATH = "/portal";
    expect(withBasePath("/portal/api/auth/me")).toBe("/portal/api/auth/me");
  });
});
