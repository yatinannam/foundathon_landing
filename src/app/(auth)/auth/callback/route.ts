import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/api/auth/callback", requestUrl.origin);
  redirectUrl.search = requestUrl.search;

  return NextResponse.redirect(redirectUrl);
}
