import { NextResponse } from "next/server";
import { resolveAuthCallbackRedirect } from "@/server/auth/oauth";

export async function GET(request: Request) {
  const redirectTo = await resolveAuthCallbackRedirect(request);
  return NextResponse.redirect(redirectTo);
}
