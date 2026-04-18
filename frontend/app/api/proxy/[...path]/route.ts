import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, BACKEND_API_BASE } from "@/lib/constants";

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function isExpired(payload: Record<string, unknown> | null): boolean {
  if (!payload) return true;
  const exp = Number(payload.exp ?? 0);
  if (!Number.isFinite(exp) || exp <= 0) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowInSeconds;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (isExpired(parseJwtPayload(token))) {
    const expiredResponse = NextResponse.json({ message: "Session expired" }, { status: 401 });
    expiredResponse.cookies.delete(AUTH_COOKIE);
    return expiredResponse;
  }

  const resolved = await params;
  const targetPath = resolved.path.join("/");
  const query = request.nextUrl.search ? request.nextUrl.search : "";
  const targetUrl = `${BACKEND_API_BASE}/api/v1/${targetPath}${query}`;

  const response = await fetch(targetUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const text = await response.text();
  const proxiedResponse = new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });

  if (response.status === 401 || response.status === 403) {
    proxiedResponse.cookies.delete(AUTH_COOKIE);
  }

  return proxiedResponse;
}
