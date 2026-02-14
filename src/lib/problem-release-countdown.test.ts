import { describe, expect, it } from "vitest";
import { PROBLEM_STATEMENT_RELEASE_TS } from "@/data/problem-statement-release";
import { getProblemReleaseCountdown } from "@/lib/problem-release-countdown";

describe("getProblemReleaseCountdown", () => {
  it("returns active countdown values before release", () => {
    const now = PROBLEM_STATEMENT_RELEASE_TS - 65_000;
    const countdown = getProblemReleaseCountdown(now);

    expect(countdown.invalid).toBe(false);
    expect(countdown.released).toBe(false);
    expect(countdown.minutes).toBe("01");
    expect(countdown.seconds).toBe("05");
  });

  it("returns zeros and released=true after release", () => {
    const countdown = getProblemReleaseCountdown(
      PROBLEM_STATEMENT_RELEASE_TS + 1_000,
    );

    expect(countdown).toMatchObject({
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      released: true,
      invalid: false,
    });
  });
});
