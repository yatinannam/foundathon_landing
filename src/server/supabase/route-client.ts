import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv, type SupabaseEnv } from "@/server/env";

export type SupabaseRouteCredentials = SupabaseEnv;

export const getRouteSupabaseCredentials =
  (): SupabaseRouteCredentials | null => getSupabaseEnv();

export async function createRouteSupabaseClient({
  anonKey,
  url,
}: SupabaseRouteCredentials) {
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, options, value }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

export type RouteSupabaseClient = Awaited<
  ReturnType<typeof createRouteSupabaseClient>
>;
