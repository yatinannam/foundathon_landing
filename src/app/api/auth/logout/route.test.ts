import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolveRootRedirect: vi.fn(),
  signOutCurrentUser: vi.fn(),
}));

vi.mock("@/server/auth/oauth", () => ({
  resolveRootRedirect: mocks.resolveRootRedirect,
  signOutCurrentUser: mocks.signOutCurrentUser,
}));

describe("/api/auth/logout", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.resolveRootRedirect.mockReset();
    mocks.signOutCurrentUser.mockReset();

    mocks.resolveRootRedirect.mockReturnValue("http://localhost/");
    mocks.signOutCurrentUser.mockResolvedValue(undefined);
  });

  it("GET signs out and redirects with 303", async () => {
    const { GET } = await import("./route");
    const request = new Request("http://localhost/api/auth/logout", {
      method: "GET",
    });

    const response = await GET(request);

    expect(mocks.signOutCurrentUser).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("POST signs out and redirects with 303", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/auth/logout", {
      method: "POST",
    });

    const response = await POST(request);

    expect(mocks.signOutCurrentUser).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });
});
