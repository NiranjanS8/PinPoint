import type {
  ApiError,
  ContentQueryParams,
  Folder,
  FolderTreeNode,
  SavedContent
} from "../types/content";

const API_ROOT = "http://localhost:9090/api";
const CONTENT_API_BASE_URL = `${API_ROOT}/content`;
const FOLDER_API_BASE_URL = `${API_ROOT}/folders`;

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

function buildQueryString(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const contentApi = {
  async getAll(params: ContentQueryParams = {}): Promise<SavedContent[]> {
    const queryString = buildQueryString({
      folderId: params.folderId,
      search: params.search,
      sort: params.sort,
      pinned: params.pinned,
      contentType: params.contentType
    });

    const response = await fetch(`${CONTENT_API_BASE_URL}${queryString}`);
    return parseResponse<SavedContent[]>(response);
  },

  async add(url: string): Promise<SavedContent> {
    const response = await fetch(CONTENT_API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    return parseResponse<SavedContent>(response);
  },

  async togglePin(id: number): Promise<SavedContent> {
    const response = await fetch(`${CONTENT_API_BASE_URL}/${id}/pin`, {
      method: "PUT"
    });

    return parseResponse<SavedContent>(response);
  },

  async assignFolder(id: number, folderId: number | null): Promise<SavedContent> {
    const response = await fetch(`${CONTENT_API_BASE_URL}/${id}/folder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ folderId })
    });

    return parseResponse<SavedContent>(response);
  },

  async remove(id: number): Promise<void> {
    const response = await fetch(`${CONTENT_API_BASE_URL}/${id}`, {
      method: "DELETE"
    });

    return parseResponse<void>(response);
  }
};

export const folderApi = {
  async getAll(): Promise<Folder[]> {
    const response = await fetch(FOLDER_API_BASE_URL);
    return parseResponse<Folder[]>(response);
  },

  async getTree(): Promise<FolderTreeNode[]> {
    const response = await fetch(`${FOLDER_API_BASE_URL}/tree`);
    return parseResponse<FolderTreeNode[]>(response);
  },

  async create(name: string, parentId: number | null): Promise<Folder> {
    const response = await fetch(FOLDER_API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, parentId })
    });

    return parseResponse<Folder>(response);
  },

  async rename(id: number, name: string): Promise<Folder> {
    const response = await fetch(`${FOLDER_API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });

    return parseResponse<Folder>(response);
  },

  async remove(id: number): Promise<void> {
    const response = await fetch(`${FOLDER_API_BASE_URL}/${id}`, {
      method: "DELETE"
    });

    return parseResponse<void>(response);
  }
};
