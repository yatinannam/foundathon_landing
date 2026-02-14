import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { type TeamRecord, teamSubmissionSchema } from "@/lib/register-schema";
import { readTeams, writeTeams } from "@/lib/register-store";

export async function GET() {
  const teams = await readTeams();
  return NextResponse.json({ teams });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = teamSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const team: TeamRecord = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...parsed.data,
  };

  const teams = await readTeams();
  const nextTeams = [team, ...teams];
  await writeTeams(nextTeams);

  return NextResponse.json({ team, teams: nextTeams }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Team id is required." },
      { status: 400 },
    );
  }

  const teams = await readTeams();
  const nextTeams = teams.filter((team) => team.id !== id);
  await writeTeams(nextTeams);

  return NextResponse.json({ teams: nextTeams });
}
