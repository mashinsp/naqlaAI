import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";

export type UserSession = {
  token: string;
  userId: number;
  username: string;
  roles: string[];
  regionCity: string | null;
};

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
}

export function isJwtExpired(payload: Record<string, unknown> | null): boolean {
  if (!payload) return true;
  const exp = Number(payload.exp ?? 0);
  if (!Number.isFinite(exp) || exp <= 0) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowInSeconds;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const payload = parseJwtPayload(token);
  if (!payload || isJwtExpired(payload)) return null;

  const rolesValue = payload.roles;
  const roles = Array.isArray(rolesValue)
    ? rolesValue.map((value) => String(value))
    : [];

  return {
    token,
    userId: Number(payload.uid ?? 0),
    username: String(payload.sub ?? ""),
    roles,
    regionCity: payload.regionCity ? String(payload.regionCity) : null,
  };
}

export function hasRole(session: UserSession | null, role: "ADMIN" | "MANAGER" | "VIEWER"): boolean {
  if (!session) return false;
  return session.roles.includes(`ROLE_${role}`) || session.roles.includes(role);
}
