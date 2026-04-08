import { describe, expect, it } from "vitest";
import { canRunContentAction, getAccessTabs } from "./admin-policy";

describe("admin policy matrix", () => {
  it("allows moderator moderation actions but blocks delete", () => {
    expect(canRunContentAction("MODERATOR", "HIDE")).toBe(true);
    expect(canRunContentAction("MODERATOR", "UNHIDE")).toBe(true);
    expect(canRunContentAction("MODERATOR", "LOCK")).toBe(true);
    expect(canRunContentAction("MODERATOR", "DELETE")).toBe(false);
  });

  it("allows admin all actions", () => {
    expect(canRunContentAction("ADMIN", "DELETE")).toBe(true);
    expect(canRunContentAction("ADMIN", "LOCK")).toBe(true);
    expect(canRunContentAction("ADMIN", "ANY_CUSTOM_ACTION")).toBe(true);
  });

  it("returns expected tab access by role", () => {
    expect(getAccessTabs("MODERATOR")).toEqual(["moderation", "content"]);
    expect(getAccessTabs("ADMIN")).toEqual([
      "moderation",
      "content",
      "cannapedia",
      "users",
      "analytics",
      "audit",
    ]);
  });
});
