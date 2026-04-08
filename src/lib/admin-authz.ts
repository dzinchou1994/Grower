import { getServerSessionUser, type SessionUser } from "@/lib/auth-session";

export class AdminAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireAdminOrModerator(): Promise<SessionUser> {
  const session = await getServerSessionUser();
  if (!session) {
    throw new AdminAuthError(401, "Authentication required.");
  }

  if (session.role !== "ADMIN" && session.role !== "MODERATOR") {
    throw new AdminAuthError(403, "Admin or moderator access required.");
  }

  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getServerSessionUser();
  if (!session) {
    throw new AdminAuthError(401, "Authentication required.");
  }

  if (session.role !== "ADMIN") {
    throw new AdminAuthError(403, "Admin access required.");
  }

  return session;
}

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return { status: error.status, body: { error: error.message } };
  }
  return { status: 500, body: { error: "Unexpected admin error." } };
}
