import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  beginGoogleOAuthLogin: vi.fn(),
}));

vi.mock("@/server/auth/oauth", () => ({
  beginGoogleOAuthLogin: mocks.beginGoogleOAuthLogin,
}));

describe("/api/auth/login GET", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.beginGoogleOAuthLogin.mockReset();
  });

  it("returns 500 when Supabase env is missing", async () => {
    mocks.beginGoogleOAuthLogin.mockResolvedValue({
      error: "Supabase environment variables are not configured.",
      ok: false,
    });

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe(
      "Supabase environment variables are not configured.",
    );
  });

  it("returns 500 when OAuth provider call fails", async () => {
    mocks.beginGoogleOAuthLogin.mockResolvedValue({
      error: "oauth failed",
      ok: false,
    });

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("oauth failed");
  });

  it("redirects to the provider URL on success", async () => {
    mocks.beginGoogleOAuthLogin.mockResolvedValue({
      ok: true,
      url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=abc",
    });

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth?client_id=abc",
    );
  });
});
