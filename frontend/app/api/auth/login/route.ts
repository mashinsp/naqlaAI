import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, BACKEND_API_BASE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await request.json();
  let response: Response;
  try {
    response = await fetch(`${BACKEND_API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Backend unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }

  if (!response.ok) {
    let backendMessage = "Invalid credentials";
    try {
      const payload = await response.json();
      if (payload?.message) {
        backendMessage = payload.message;
      }
    } catch {
      // ignore parsing failure and fallback to generic message
    }
    return NextResponse.json({ message: backendMessage }, { status: response.status });
  }

  const data = await response.json();
  const nextResponse = NextResponse.json({
    userId: data.userId,
    username: data.username,
    regionCity: data.regionCity ?? null,
    roles: data.roles ?? [],
  });

  nextResponse.cookies.set(AUTH_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return nextResponse;
}
