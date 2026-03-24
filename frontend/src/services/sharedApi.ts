import type { ApiErrorResponse } from "../types/api";

export async function parseResponse<T>(response: Response): Promise<T> {
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

export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("Backend is unavailable. Make sure Spring Boot is running on http://localhost:9090.");
  }
}
