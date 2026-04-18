import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { AUTH_COOKIE } from "@/lib/constants";

const intlMiddleware = createMiddleware(routing);

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function hasRole(payload: Record<string, unknown> | null, role: string): boolean {
  if (!payload) return false;
  const raw = payload.roles;
  if (!Array.isArray(raw)) return false;
  const roles = raw.map((value) => String(value));
  return roles.includes(role) || roles.includes(`ROLE_${role}`);
}

function isExpired(payload: Record<string, unknown> | null): boolean {
  if (!payload) return true;
  const exp = Number(payload.exp ?? 0);
  if (!Number.isFinite(exp) || exp <= 0) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowInSeconds;
}

export default function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;

  const localeMatch = pathname.match(/^\/(en|ar)(\/.*)?$/);
  if (!localeMatch) {
    return intlResponse;
  }

  const locale = localeMatch[1];
  const localPath = localeMatch[2] || "/";
  const isPublic = localPath === "/login";

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? decodePayload(token) : null;
  const tokenExpired = token ? isExpired(payload) : false;

  if (tokenExpired) {
    const redirectResponse = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    redirectResponse.cookies.delete(AUTH_COOKIE);
    return redirectResponse;
  }

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
  if (token && isPublic) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Role-specific route restrictions.
  if (localPath.startsWith("/drivers") || localPath.startsWith("/alerts")) {
    if (!hasRole(payload, "ADMIN") && !hasRole(payload, "MANAGER")) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*"],
};
