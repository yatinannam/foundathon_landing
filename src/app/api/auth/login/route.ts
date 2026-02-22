import { NextResponse } from "next/server";
import { beginGoogleOAuthLogin } from "@/server/auth/oauth";

export async function GET() {
  const result = await beginGoogleOAuthLogin();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.redirect(result.url);
}
