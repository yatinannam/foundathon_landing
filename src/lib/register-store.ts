import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type TeamRecord, teamRecordListSchema } from "@/lib/register-schema";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "register-teams.json");

export const readTeams = async (): Promise<TeamRecord[]> => {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    // Backward compatibility: old SRM records may not have a teamName field.
    const normalized = parsed.map((team) => {
      if (
        team &&
        typeof team === "object" &&
        "teamType" in team &&
        team.teamType === "srm" &&
        (!("teamName" in team) ||
          typeof (team as { teamName?: unknown }).teamName !== "string")
      ) {
        return { ...team, teamName: "SRM Team" };
      }
      return team;
    });

    const validated = teamRecordListSchema.safeParse(normalized);
    if (!validated.success) return [];
    return validated.data;
  } catch {
    return [];
  }
};

export const writeTeams = async (teams: TeamRecord[]) => {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(teams, null, 2), "utf8");
};
