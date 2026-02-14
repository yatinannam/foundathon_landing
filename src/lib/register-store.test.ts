import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe.sequential("register-store", () => {
  const originalCwd = process.cwd();
  let tempRoot = "";

  beforeEach(async () => {
    vi.resetModules();
    tempRoot = await mkdtemp(join(tmpdir(), "foundathon-store-"));
    process.chdir(tempRoot);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it("returns [] when data file is missing", async () => {
    const { readTeams } = await import("@/lib/register-store");
    const teams = await readTeams();
    expect(teams).toEqual([]);
  });

  it("migrates SRM records without teamName while reading", async () => {
    const dataDir = join(tempRoot, "data");
    const file = join(dataDir, "register-teams.json");
    await mkdir(dataDir, { recursive: true });
    await writeFile(
      file,
      JSON.stringify([
        {
          id: "t1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          teamType: "srm",
          lead: {
            name: "Lead",
            raNumber: "RA1",
            collegeId: "ID1",
            dept: "CSE",
            contact: "9999999999",
          },
          members: [
            {
              name: "M1",
              raNumber: "RA2",
              collegeId: "ID2",
              dept: "CSE",
              contact: "8888888888",
            },
            {
              name: "M2",
              raNumber: "RA3",
              collegeId: "ID3",
              dept: "ECE",
              contact: "7777777777",
            },
          ],
        },
      ]),
      "utf8",
    );

    const { readTeams } = await import("@/lib/register-store");
    const teams = await readTeams();

    expect(teams).toHaveLength(1);
    expect(teams[0]?.teamName).toBe("SRM Team");
  });
});
