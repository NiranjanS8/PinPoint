import type { ApiErrorResponse, FolderDto, FolderTreeDto } from "../types/api";

const FOLDER_API_BASE_URL = "http://localhost:9090/api/folders";

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

export async function fetchFolders(): Promise<FolderDto[]> {
  const response = await safeFetch(FOLDER_API_BASE_URL);
  return parseResponse<FolderDto[]>(response);
}

export async function fetchFolderTree(): Promise<FolderTreeDto[]> {
  const response = await safeFetch(`${FOLDER_API_BASE_URL}/tree`);
  return parseResponse<FolderTreeDto[]>(response);
}

export async function createFolder(name: string, parentId: number | null, description?: string): Promise<FolderDto> {
  const response = await safeFetch(FOLDER_API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, parentId, description })
  });

  return parseResponse<FolderDto>(response);
}

export async function updateFolder(
  id: number,
  name: string,
  parentId: number | null,
  description?: string
): Promise<FolderDto> {
  const response = await safeFetch(`${FOLDER_API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, parentId, description })
  });

  return parseResponse<FolderDto>(response);
}

export async function deleteFolder(id: number): Promise<void> {
  const response = await safeFetch(`${FOLDER_API_BASE_URL}/${id}`, {
    method: "DELETE"
  });

  await parseResponse<void>(response);
}
