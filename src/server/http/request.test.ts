import { describe, expect, it } from "vitest";
import { isJsonRequest, parseJsonSafely } from "@/server/http/request";

describe("server/http/request", () => {
  it("detects JSON content type", () => {
    const jsonRequest = new Request("http://localhost", {
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const plainRequest = new Request("http://localhost", {
      headers: { "content-type": "text/plain" },
      method: "POST",
    });

    expect(isJsonRequest(jsonRequest)).toBe(true);
    expect(isJsonRequest(plainRequest)).toBe(false);
  });

  it("parses valid JSON payloads", async () => {
    const request = new Request("http://localhost", {
      body: JSON.stringify({ id: "abc" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const parsed = await parseJsonSafely(request);
    expect(parsed).toEqual({ id: "abc" });
  });

  it("returns null for invalid JSON payloads", async () => {
    const request = new Request("http://localhost", {
      body: "{invalid",
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const parsed = await parseJsonSafely(request);
    expect(parsed).toBeNull();
  });
});
