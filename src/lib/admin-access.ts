const DEFAULT_ADMIN_EMAILS = ["dzin.chou@gmail.com"];

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw?.trim()) {
    return DEFAULT_ADMIN_EMAILS;
  }
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(email.toLowerCase());
}
