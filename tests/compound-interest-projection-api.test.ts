// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleProjectionRequest } from "@/features/compound-calculator/api/projection-handler";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("projection API proxy", () => {
  it("appends the projections path to the configured API base URL", async () => {
    vi.stubEnv("OLIVE_CAP_API_URL", "https://incom-api.manuelji.dev/api/v1/");
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("network unavailable"));
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleProjectionRequest(new Request("http://localhost/api/compound-interest/projections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initial_principal: "10000.00", duration_years: 20, expected_annual_return_percent: "7" }),
    }));

    expect(response.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://incom-api.manuelji.dev/api/v1/compound-interest/projections",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
