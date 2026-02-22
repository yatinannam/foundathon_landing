import { getRouteAuthContext } from "@/server/auth/context";
import { jsonError, jsonNoStore } from "@/server/http/response";
import { listProblemStatementAvailability } from "@/server/problem-statements/service";

export async function GET() {
  const context = await getRouteAuthContext();
  if (!context.ok) {
    return context.response;
  }

  const result = await listProblemStatementAvailability({
    supabase: context.supabase,
  });

  if (!result.ok) {
    return jsonError(result.error, result.status);
  }

  return jsonNoStore(result.data, result.status);
}
