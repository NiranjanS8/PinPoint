import type { StudyGoalDto } from "../types/api";
import { parseResponse, safeFetch } from "./sharedApi";

const GOALS_BASE_URL = "http://localhost:9090/api/goals";

export async function fetchGoals(): Promise<StudyGoalDto[]> {
  const response = await safeFetch(GOALS_BASE_URL);
  return parseResponse<StudyGoalDto[]>(response);
}

export async function createGoal(payload: {
  title: string;
  targetDate: string;
  contentId?: number | null;
}): Promise<StudyGoalDto> {
  const response = await safeFetch(GOALS_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseResponse<StudyGoalDto>(response);
}

export async function updateGoal(
  id: number,
  payload: { title?: string; targetDate?: string; contentId?: number | null; completed?: boolean }
): Promise<StudyGoalDto> {
  const response = await safeFetch(`${GOALS_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseResponse<StudyGoalDto>(response);
}

export async function deleteGoal(id: number): Promise<void> {
  const response = await safeFetch(`${GOALS_BASE_URL}/${id}`, { method: "DELETE" });
  await parseResponse<void>(response);
}
