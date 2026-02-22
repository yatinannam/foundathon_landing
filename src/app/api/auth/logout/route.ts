import { NextResponse } from "next/server";
import { resolveRootRedirect, signOutCurrentUser } from "@/server/auth/oauth";

export async function GET(request: Request) {
  await signOutCurrentUser();
  return NextResponse.redirect(resolveRootRedirect(request), { status: 303 });
}

export async function POST(request: Request) {
  await signOutCurrentUser();
  return NextResponse.redirect(resolveRootRedirect(request), { status: 303 });
}
