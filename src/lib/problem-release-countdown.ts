import { PROBLEM_STATEMENT_RELEASE_TS } from "@/data/problem-statement-release";

export type ReleaseCountdown = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  released: boolean;
  invalid: boolean;
};

export const getProblemReleaseCountdown = (
  now = Date.now(),
): ReleaseCountdown => {
  if (!Number.isFinite(PROBLEM_STATEMENT_RELEASE_TS)) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      released: false,
      invalid: true,
    };
  }

  const diff = PROBLEM_STATEMENT_RELEASE_TS - now;
  if (diff <= 0) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      released: true,
      invalid: false,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    released: false,
    invalid: false,
  };
};
