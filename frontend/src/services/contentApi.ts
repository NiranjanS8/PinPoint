import type { LearningStatus, SavedContentDto } from "../types/api";
import { parseResponse, safeFetch } from "./sharedApi";

const API_BASE_URL = "http://localhost:9090/api/content";

export async function fetchContent(): Promise<SavedContentDto[]> {
  const response = await safeFetch(API_BASE_URL);
  return parseResponse<SavedContentDto[]>(response);
}

export async function fetchFilteredContent(params: {
  folderId?: number | null;
  search?: string;
  sort?: string;
  pinned?: boolean;
  contentType?: "VIDEO" | "PLAYLIST";
}): Promise<SavedContentDto[]> {
  const query = new URLSearchParams();

  if (params.folderId !== undefined && params.folderId !== null) {
    query.set("folderId", String(params.folderId));
  }
  if (params.search) {
    query.set("search", params.search);
  }
  if (params.sort) {
    query.set("sort", params.sort);
  }
  if (params.pinned !== undefined) {
    query.set("pinned", String(params.pinned));
  }
  if (params.contentType) {
    query.set("contentType", params.contentType);
  }

  const response = await safeFetch(`${API_BASE_URL}?${query.toString()}`);
  return parseResponse<SavedContentDto[]>(response);
}

export async function fetchContentById(id: number): Promise<SavedContentDto> {
  const response = await safeFetch(`${API_BASE_URL}/${id}`);
  return parseResponse<SavedContentDto>(response);
}

export async function fetchContinueLearning(): Promise<SavedContentDto[]> {
  const response = await safeFetch(`${API_BASE_URL}/continue-learning`);
  return parseResponse<SavedContentDto[]>(response);
}

export async function fetchRecentlyWatched(): Promise<SavedContentDto[]> {
  const response = await safeFetch(`${API_BASE_URL}/recently-watched`);
  return parseResponse<SavedContentDto[]>(response);
}

export async function createContent(url: string): Promise<SavedContentDto> {
  const response = await safeFetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  return parseResponse<SavedContentDto>(response);
}

export async function togglePinned(id: number): Promise<SavedContentDto> {
  const response = await safeFetch(`${API_BASE_URL}/${id}/pin`, {
    method: "PUT"
  });

  return parseResponse<SavedContentDto>(response);
}

export async function updateContent(
  id: number,
  payload: { status?: LearningStatus; progressPercent?: number; notes?: string; tags?: string }
): Promise<SavedContentDto> {
  const response = await safeFetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<SavedContentDto>(response);
}

export async function updateContentProgress(
  id: number,
  payload: { status?: LearningStatus; progressPercent?: number; lastPlaybackSeconds?: number }
): Promise<SavedContentDto> {
  const response = await safeFetch(`${API_BASE_URL}/${id}/progress`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<SavedContentDto>(response);
}

export async function markContentOpened(id: number): Promise<SavedContentDto> {
  const response = await safeFetch(`${API_BASE_URL}/${id}/opened`, {
    method: "PUT"
  });

  return parseResponse<SavedContentDto>(response);
}

export async function updateContentFolder(id: number, folderId: number | null): Promise<SavedContentDto> {
  const response = await safeFetch(`${API_BASE_URL}/${id}/folder`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ folderId })
  });

  return parseResponse<SavedContentDto>(response);
}

export async function deleteContent(id: number): Promise<void> {
  const response = await safeFetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE"
  });

  await parseResponse<void>(response);
}
