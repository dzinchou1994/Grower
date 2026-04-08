export type AdminRole = "ADMIN" | "MODERATOR";

const moderatorAllowedActions = new Set([
  "HIDE",
  "UNHIDE",
  "LOCK",
  "UNLOCK",
  "PIN",
  "UNPIN",
]);

export function canRunContentAction(role: AdminRole, action: string) {
  if (role === "ADMIN") {
    return true;
  }
  return moderatorAllowedActions.has(action);
}

export function getAccessTabs(role: AdminRole) {
  if (role === "ADMIN") {
    return ["moderation", "content", "users", "analytics", "audit"] as const;
  }
  return ["moderation", "content"] as const;
}
