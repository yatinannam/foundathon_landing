import { z } from "zod";
import { parseJsonSafely } from "@/server/http/request";
import { sendProblemLockEmail } from "@/server/notifications/problem-lock-email-service";

const sendEmailPayloadBaseSchema = z.object({
  leadName: z.string().trim().min(1, "Lead name is required."),
  leadEmail: z.email("Lead email is invalid."),
  teamName: z.string().trim().min(1, "Team name is required."),
  problemStatementId: z
    .string()
    .trim()
    .min(1, "Problem statement id is required."),
  problemStatementTitle: z
    .string()
    .trim()
    .min(1, "Problem statement title is required."),
  problemStatementSummary: z
    .string()
    .trim()
    .min(1, "Problem statement summary is required."),
  lockExpiresAtIso: z
    .string()
    .trim()
    .min(1, "Lock expiry timestamp is required."),
  lockedAtIso: z.string().trim().min(1, "Lock timestamp is required."),
});

const sendEmailPayloadSchema = z.discriminatedUnion("notificationType", [
  sendEmailPayloadBaseSchema.extend({
    notificationType: z.literal("lock_confirmed"),
  }),
  sendEmailPayloadBaseSchema.extend({
    abandonedAtIso: z.string().trim().min(1, "Abandon timestamp is required."),
    notificationType: z.literal("lock_abandoned"),
  }),
]);

export async function POST(request: Request) {
  const body = await parseJsonSafely(request);
  if (body === null) {
    return Response.json(
      {
        error: "Invalid JSON payload.",
        reason: "invalid_payload",
        sent: false,
      },
      { status: 400 },
    );
  }

  const parsed = sendEmailPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid payload.",
        reason: "invalid_payload",
        sent: false,
      },
      { status: 400 },
    );
  }

  const result = await sendProblemLockEmail(parsed.data);
  return Response.json(result.body, { status: result.status });
}
