import type { ApiErrorResponse, StudyQueueItemDto } from "../types/api";

const STUDY_QUEUE_API_BASE_URL = "http://localhost:9090/api/study-queue";

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  let message = "Something went wrong";

  try {
    const errorBody = (await response.json()) as ApiErrorResponse;
    if (errorBody.message) {
      message = errorBody.message;
    }
  } catch {
    message = response.statusText || message;
  }

  throw new Error(message);
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("Backend is unavailable. Make sure Spring Boot is running on http://localhost:9090.");
  }
}

export async function fetchStudyQueue(): Promise<StudyQueueItemDto[]> {
  const response = await safeFetch(STUDY_QUEUE_API_BASE_URL);
  return parseResponse<StudyQueueItemDto[]>(response);
}

export async function addToStudyQueue(contentId: number): Promise<StudyQueueItemDto> {
  const response = await safeFetch(STUDY_QUEUE_API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ contentId })
  });

  return parseResponse<StudyQueueItemDto>(response);
}

export async function removeFromStudyQueue(queueItemId: number): Promise<void> {
  const response = await safeFetch(`${STUDY_QUEUE_API_BASE_URL}/${queueItemId}`, {
    method: "DELETE"
  });

  await parseResponse<void>(response);
}
