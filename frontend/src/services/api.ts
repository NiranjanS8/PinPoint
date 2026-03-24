import type { ApiError, SavedContent } from "../types/content";

const API_BASE_URL = "http://localhost:9090/api/content";

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  }

  let errorMessage = "Something went wrong.";

  try {
    const apiError = (await response.json()) as ApiError;
    errorMessage = apiError.details?.[0] || apiError.message || errorMessage;
  } catch {
    errorMessage = response.statusText || errorMessage;
  }

  throw new Error(errorMessage);
}

export const contentApi = {
  async getAll(): Promise<SavedContent[]> {
    const response = await fetch(API_BASE_URL);
    return parseResponse<SavedContent[]>(response);
  },

  async add(url: string): Promise<SavedContent> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    return parseResponse<SavedContent>(response);
  },

  async togglePin(id: number): Promise<SavedContent> {
    const response = await fetch(`${API_BASE_URL}/${id}/pin`, {
      method: "PUT"
    });

    return parseResponse<SavedContent>(response);
  },

  async remove(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE"
    });

    return parseResponse<void>(response);
  }
};
