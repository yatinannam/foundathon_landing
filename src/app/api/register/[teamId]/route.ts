import { type NextRequest, NextResponse } from "next/server";
import { type TeamRecord, teamSubmissionSchema } from "@/lib/register-schema";
import { readTeams, writeTeams } from "@/lib/register-store";

type Params = { params: Promise<{ teamId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { teamId } = await params;
  const teams = await readTeams();
  const team = teams.find((item) => item.id === teamId);

  if (!team) {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }

  return NextResponse.json({ team });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { teamId } = await params;
  const body = await request.json();
  const parsed = teamSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const teams = await readTeams();
  const index = teams.findIndex((item) => item.id === teamId);

  if (index === -1) {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }

  const previous = teams[index];
  const updated: TeamRecord = {
    ...parsed.data,
    id: previous.id,
    createdAt: previous.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const nextTeams = teams.map((item, idx) => (idx === index ? updated : item));
  await writeTeams(nextTeams);

  return NextResponse.json({ team: updated });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { teamId } = await params;
  const teams = await readTeams();
  const nextTeams = teams.filter((item) => item.id !== teamId);
  await writeTeams(nextTeams);

  return NextResponse.json({ teams: nextTeams });
}
