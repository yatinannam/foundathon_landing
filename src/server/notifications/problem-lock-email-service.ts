import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { getFoundathonResendApiKey, getFoundathonSiteUrl } from "@/server/env";

type SendEmailPayloadBase = {
  leadName: string;
  leadEmail: string;
  teamName: string;
  problemStatementId: string;
  problemStatementTitle: string;
  problemStatementSummary: string;
  lockExpiresAtIso: string;
  lockedAtIso: string;
};

type SendEmailPayload =
  | (SendEmailPayloadBase & {
      notificationType: "lock_confirmed";
    })
  | (SendEmailPayloadBase & {
      abandonedAtIso: string;
      notificationType: "lock_abandoned";
    });

type SendEmailResultBody =
  | {
      id: string | null | undefined;
      sent: true;
    }
  | {
      error?: string;
      reason: "missing_api_key" | "provider_error";
      sent: false;
    };

export type SendEmailResult = {
  body: SendEmailResultBody;
  status: number;
};

const FROM = "Admin <no-reply@thefoundersclub.tech>";

const toProviderErrorMessage = (error: unknown) => {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const providerError = error as { message?: unknown; name?: unknown };
    if (
      typeof providerError.message === "string" &&
      providerError.message.trim().length > 0
    ) {
      return providerError.message;
    }

    if (
      typeof providerError.name === "string" &&
      providerError.name.trim().length > 0
    ) {
      return providerError.name;
    }
  }

  return "Email provider error";
};

const normalizeSiteUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

export const sendProblemLockEmail = async (
  payload: SendEmailPayload,
): Promise<SendEmailResult> => {
  const apiKey = getFoundathonResendApiKey();
  if (!apiKey) {
    return {
      body: {
        reason: "missing_api_key",
        sent: false,
      },
      status: 200,
    };
  }

  const resend = new Resend(apiKey);
  const ctaBaseUrl = normalizeSiteUrl(getFoundathonSiteUrl() ?? "");

  try {
    const subject =
      payload.notificationType === "lock_abandoned"
        ? `Foundathon: Registration Abandoned - ${payload.problemStatementTitle}`
        : `Foundathon: Problem Statement Locked - ${payload.problemStatementTitle}`;

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [payload.leadEmail],
      subject,
      react: EmailTemplate({
        abandonedAtIso:
          payload.notificationType === "lock_abandoned"
            ? payload.abandonedAtIso
            : undefined,
        ctaBaseUrl,
        leadEmail: payload.leadEmail,
        leadName: payload.leadName,
        lockExpiresAtIso: payload.lockExpiresAtIso,
        lockedAtIso: payload.lockedAtIso,
        notificationType: payload.notificationType,
        problemStatementId: payload.problemStatementId,
        problemStatementSummary: payload.problemStatementSummary,
        problemStatementTitle: payload.problemStatementTitle,
        teamName: payload.teamName,
      }),
    });

    if (error) {
      const message = toProviderErrorMessage(error);
      console.error("Problem lock email provider error:", message);
      return {
        body: {
          error: message,
          reason: "provider_error",
          sent: false,
        },
        status: 200,
      };
    }

    return {
      body: { id: data?.id, sent: true },
      status: 200,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Problem lock email send failure:", message);
    return {
      body: {
        error: message,
        reason: "provider_error",
        sent: false,
      },
      status: 200,
    };
  }
};
