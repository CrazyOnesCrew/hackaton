import { describe, expect, it } from "vitest";
import { entriesFor, isPortalRole, ROLE_LABELS, roleHome } from "./navigation";

describe("role-based navigation", () => {
  it("member sees only the shared entries", () => {
    const entries = entriesFor("member");
    expect(entries.map((e) => e.href)).toEqual(["/dashboard"]);
  });

  it("admin sees the shared entries plus admin-only areas", () => {
    const entries = entriesFor("admin");
    expect(entries.map((e) => e.href)).toEqual(["/dashboard", "/admin"]);
  });

  it("roleHome maps every role to the dashboard", () => {
    expect(roleHome("admin")).toBe("/dashboard");
    expect(roleHome("member")).toBe("/dashboard");
  });

  it("isPortalRole accepts only portal roles", () => {
    expect(isPortalRole("admin")).toBe(true);
    expect(isPortalRole("member")).toBe(true);
    expect(isPortalRole("traveler")).toBe(false);
    expect(isPortalRole(null)).toBe(false);
    expect(isPortalRole(undefined)).toBe(false);
  });

  it("exposes role labels", () => {
    expect(ROLE_LABELS.admin).toBe("Admin");
    expect(ROLE_LABELS.member).toBe("Member");
  });
});
