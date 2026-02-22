import {
  getProblemStatementById,
  PROBLEM_STATEMENT_CAP,
} from "@/data/problem-statements";
import { verifyProblemLockToken } from "@/lib/problem-lock-token";
import {
  countProblemStatementRegistrations,
  getProblemStatementIdFromDetails,
  type ProblemStatementCountRow,
} from "@/lib/problem-statement-availability";
import {
  type RegistrationRow,
  toTeamRecord,
  toTeamSummary,
  UUID_PATTERN,
  withSrmEmailNetIds,
} from "@/lib/register-api";
import type { TeamSubmission } from "@/lib/register-schema";
import {
  deleteRegistrationByQueryIdForUser,
  deleteRegistrationByTeamIdForUser,
  findAnyRegistrationForUser,
  findRegistrationByTeamIdForUser,
  insertRegistration,
  listProblemStatementRows,
  listRegistrationsForUser,
  updateRegistrationDetailsByTeamIdForUser,
} from "@/server/registration/repository";
import type { RouteSupabaseClient } from "@/server/supabase/route-client";

type ServiceSuccess<T> = {
  data: T;
  ok: true;
  status: number;
};

type ServiceFailure = {
  error: string;
  ok: false;
  status: number;
};

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;

const ok = <T>(data: T, status = 200): ServiceSuccess<T> => ({
  data,
  ok: true,
  status,
});

const fail = (error: string, status: number): ServiceFailure => ({
  error,
  ok: false,
  status,
});

const PROBLEM_STATEMENT_DETAIL_KEYS = [
  "problemStatementId",
  "problemStatementTitle",
  "problemStatementCap",
  "problemStatementLockedAt",
] as const;

type ServiceContext = {
  supabase: RouteSupabaseClient;
  userId: string;
};

type CreateTeamInput = {
  lockToken: string;
  problemStatementId: string;
  team: TeamSubmission;
};

type PatchTeamInput = {
  lock?: {
    lockToken: string;
    problemStatementId: string;
  };
  team: TeamSubmission;
};

export const listTeams = async ({
  supabase,
  userId,
}: ServiceContext): Promise<
  ServiceResult<{ teams: ReturnType<typeof toTeamSummary>[] }>
> => {
  const { data, error } = await listRegistrationsForUser(supabase, userId);

  if (error) {
    return fail("Failed to fetch registrations.", 500);
  }

  const teams = ((data ?? []) as RegistrationRow[]).map((row) =>
    toTeamSummary(row),
  );

  return ok({ teams });
};

export const createTeam = async ({
  input,
  supabase,
  userEmail,
  userId,
}: ServiceContext & {
  input: CreateTeamInput;
  userEmail?: string;
}): Promise<ServiceResult<{ team: { id: string } }>> => {
  const problemStatement = getProblemStatementById(input.problemStatementId);

  if (!problemStatement) {
    return fail("Problem statement not found.", 400);
  }

  const lockVerification = verifyProblemLockToken({
    problemStatementId: problemStatement.id,
    token: input.lockToken,
    userId,
  });

  if (!lockVerification.valid) {
    return fail(lockVerification.error, 400);
  }

  const teamDetails = withSrmEmailNetIds(input.team);
  const details: Record<string, unknown> = {
    ...teamDetails,
    problemStatementCap: PROBLEM_STATEMENT_CAP,
    problemStatementId: problemStatement.id,
    problemStatementLockedAt: new Date(
      lockVerification.payload.iat,
    ).toISOString(),
    problemStatementTitle: problemStatement.title,
  };

  const { data: existingRegistration, error: existingRegistrationError } =
    await findAnyRegistrationForUser(supabase, userId);

  if (existingRegistrationError) {
    return fail("Failed to validate existing registrations.", 500);
  }

  if (existingRegistration) {
    return fail("You have already registered for this event.", 409);
  }

  const { data: statementRows, error: statementRowsError } =
    await listProblemStatementRows(supabase);

  if (statementRowsError) {
    return fail("Failed to check statement availability.", 500);
  }

  const registeredCount = countProblemStatementRegistrations(
    (statementRows ?? []) as ProblemStatementCountRow[],
    problemStatement.id,
  );

  if (registeredCount >= PROBLEM_STATEMENT_CAP) {
    return fail("This problem statement is currently unavailable.", 409);
  }

  const { data, error } = await insertRegistration({
    details,
    registrationEmail: userEmail ?? "",
    supabase,
    userId,
  });

  if (error || !data) {
    return fail(error?.message || "Failed to create registration.", 500);
  }

  const teamId = typeof data.id === "string" ? data.id : null;

  if (!teamId || !UUID_PATTERN.test(teamId)) {
    return fail("Failed to create registration.", 500);
  }

  return ok({ team: { id: teamId } }, 201);
};

export const deleteTeamByQueryId = async ({
  id,
  supabase,
  userId,
}: ServiceContext & {
  id: string | null | undefined;
}): Promise<ServiceResult<{ teams: ReturnType<typeof toTeamSummary>[] }>> => {
  const normalizedId = id?.trim();
  if (!normalizedId) {
    return fail("Team id is required.", 400);
  }

  if (!UUID_PATTERN.test(normalizedId)) {
    return fail("Team id is invalid.", 400);
  }

  const { data: deleted, error: deleteError } =
    await deleteRegistrationByQueryIdForUser({
      id: normalizedId,
      supabase,
      userId,
    });

  if (deleteError) {
    return fail("Failed to remove team.", 500);
  }

  if (!deleted) {
    return fail("Team not found.", 404);
  }

  const { data, error } = await listRegistrationsForUser(supabase, userId);

  if (error) {
    return fail(error.message || "Failed to delete team.", 500);
  }

  const teams = ((data ?? []) as RegistrationRow[]).map((row) =>
    toTeamSummary(row),
  );

  return ok({ teams });
};

export const getTeam = async ({
  supabase,
  teamId,
  userId,
}: ServiceContext & {
  teamId: string;
}): Promise<
  ServiceResult<{ team: NonNullable<ReturnType<typeof toTeamRecord>> }>
> => {
  if (!UUID_PATTERN.test(teamId)) {
    return fail("Team id is invalid.", 400);
  }

  const { data, error } = await findRegistrationByTeamIdForUser(
    supabase,
    teamId,
    userId,
  );

  if (error) {
    return fail(error.message || "Failed to fetch team.", 500);
  }

  if (!data) {
    return fail("Team not found.", 404);
  }

  const team = toTeamRecord(data as RegistrationRow);
  if (!team) {
    return fail("Team data is incomplete or outdated.", 422);
  }

  return ok({ team });
};

export const patchTeam = async ({
  input,
  supabase,
  teamId,
  userId,
}: ServiceContext & {
  input: PatchTeamInput;
  teamId: string;
}): Promise<
  ServiceResult<{ team: NonNullable<ReturnType<typeof toTeamRecord>> }>
> => {
  if (!UUID_PATTERN.test(teamId)) {
    return fail("Team id is invalid.", 400);
  }

  const { data: existingTeam, error: existingTeamError } =
    await findRegistrationByTeamIdForUser(supabase, teamId, userId);

  if (existingTeamError) {
    return fail(existingTeamError.message || "Failed to fetch team.", 500);
  }

  if (!existingTeam) {
    return fail("Team not found.", 404);
  }

  const existingDetails =
    existingTeam.details && typeof existingTeam.details === "object"
      ? (existingTeam.details as Record<string, unknown>)
      : {};
  const existingStatementId = getProblemStatementIdFromDetails(existingDetails);

  const updatedDetails: Record<string, unknown> = {
    ...withSrmEmailNetIds(input.team),
  };

  for (const key of PROBLEM_STATEMENT_DETAIL_KEYS) {
    const value = existingDetails[key];

    if (typeof value === "string" && value.trim().length > 0) {
      updatedDetails[key] = value;
      continue;
    }

    if (
      key === "problemStatementCap" &&
      typeof value === "number" &&
      Number.isInteger(value) &&
      value > 0
    ) {
      updatedDetails[key] = value;
    }
  }

  if (input.lock) {
    if (existingStatementId) {
      return fail("A problem statement is already locked for this team.", 409);
    }

    const problemStatement = getProblemStatementById(
      input.lock.problemStatementId,
    );

    if (!problemStatement) {
      return fail("Problem statement not found.", 400);
    }

    const lockVerification = verifyProblemLockToken({
      problemStatementId: problemStatement.id,
      token: input.lock.lockToken,
      userId,
    });

    if (!lockVerification.valid) {
      return fail(lockVerification.error, 400);
    }

    const { data: statementRows, error: statementRowsError } =
      await listProblemStatementRows(supabase);

    if (statementRowsError) {
      return fail("Failed to check statement availability.", 500);
    }

    const registeredCount = countProblemStatementRegistrations(
      (statementRows ?? []) as ProblemStatementCountRow[],
      problemStatement.id,
    );

    if (registeredCount >= PROBLEM_STATEMENT_CAP) {
      return fail("This problem statement is currently unavailable.", 409);
    }

    updatedDetails.problemStatementId = problemStatement.id;
    updatedDetails.problemStatementTitle = problemStatement.title;
    updatedDetails.problemStatementCap = PROBLEM_STATEMENT_CAP;
    updatedDetails.problemStatementLockedAt = new Date(
      lockVerification.payload.iat,
    ).toISOString();
  }

  const { data, error } = await updateRegistrationDetailsByTeamIdForUser({
    details: updatedDetails,
    supabase,
    teamId,
    userId,
  });

  if (error) {
    return fail(error.message || "Failed to update team.", 500);
  }

  if (!data) {
    return fail("Team not found.", 404);
  }

  const team = toTeamRecord(data as RegistrationRow);
  if (!team) {
    return fail("Team data is incomplete or outdated.", 422);
  }

  return ok({ team });
};

export const deleteTeam = async ({
  supabase,
  teamId,
  userId,
}: ServiceContext & {
  teamId: string;
}): Promise<ServiceResult<{ deleted: true }>> => {
  if (!UUID_PATTERN.test(teamId)) {
    return fail("Team id is invalid.", 400);
  }

  const { data: deleted, error } = await deleteRegistrationByTeamIdForUser({
    supabase,
    teamId,
    userId,
  });

  if (error) {
    return fail("Failed to remove team.", 500);
  }

  if (!deleted) {
    return fail("Team not found.", 404);
  }

  return ok({ deleted: true });
};
