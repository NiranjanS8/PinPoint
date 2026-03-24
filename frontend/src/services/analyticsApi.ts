import type { AnalyticsOverviewDto } from "../types/api";
import { parseResponse, safeFetch } from "./sharedApi";

const ANALYTICS_BASE_URL = "http://localhost:9090/api/analytics";

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverviewDto> {
  const response = await safeFetch(`${ANALYTICS_BASE_URL}/overview`);
  return parseResponse<AnalyticsOverviewDto>(response);
}

export async function logFocusSession(durationMinutes: number) {
  const response = await safeFetch(`${ANALYTICS_BASE_URL}/focus-sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ durationMinutes })
  });

  return parseResponse(response);
}
