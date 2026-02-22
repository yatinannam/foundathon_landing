import { NextResponse } from "next/server";

export const JSON_NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export const jsonNoStore = <T>(body: T, status = 200) =>
  NextResponse.json(body, { headers: JSON_NO_STORE_HEADERS, status });

export const jsonError = (
  message: string,
  status: number,
  extras?: Record<string, unknown>,
) => jsonNoStore({ error: message, ...(extras ?? {}) }, status);
