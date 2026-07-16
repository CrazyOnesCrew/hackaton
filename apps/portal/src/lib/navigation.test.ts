import { describe, expect, it } from "vitest";
import {
  entriesFor,
  isContentManager,
  isPortalRole,
  ROLE_LABELS,
  roleHome,
} from "./navigation";

describe("role-based navigation", () => {
  it("member sees only the shared dashboard", () => {
    const entries = entriesFor("member");
    expect(entries.map((e) => e.href)).toEqual(["/dashboard"]);
  });

  it("auxiliary sees dashboard and content manager routes", () => {
    const entries = entriesFor("auxiliary");
    expect(entries.map((e) => e.href)).toEqual([
      "/dashboard",
      "/content",
      "/content/exercises",
      "/content/imports",
      "/content/grades",
    ]);
  });

  it("admin sees content routes plus admin-only areas", () => {
    const entries = entriesFor("admin");
    expect(entries.map((e) => e.href)).toEqual([
      "/dashboard",
      "/content",
      "/content/exercises",
      "/content/imports",
      "/content/grades",
      "/admin",
    ]);
  });

  it("roleHome maps auxiliary to /content", () => {
    expect(roleHome("auxiliary")).toBe("/content");
    expect(roleHome("admin")).toBe("/dashboard");
    expect(roleHome("member")).toBe("/dashboard");
  });

  it("isPortalRole accepts portal roles including auxiliary", () => {
    expect(isPortalRole("admin")).toBe(true);
    expect(isPortalRole("member")).toBe(true);
    expect(isPortalRole("auxiliary")).toBe(true);
    expect(isPortalRole("traveler")).toBe(false);
    expect(isPortalRole(null)).toBe(false);
  });

  it("isContentManager allows auxiliary and admin only", () => {
    expect(isContentManager("auxiliary")).toBe(true);
    expect(isContentManager("admin")).toBe(true);
    expect(isContentManager("member")).toBe(false);
  });

  it("exposes role labels", () => {
    expect(ROLE_LABELS.admin).toBe("Admin");
    expect(ROLE_LABELS.member).toBe("Miembro");
    expect(ROLE_LABELS.auxiliary).toBe("Auxiliar");
  });
});
