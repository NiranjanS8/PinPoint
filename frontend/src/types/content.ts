export type ContentType = "VIDEO" | "PLAYLIST";
export type SortOption = "PINNED_FIRST" | "NEWEST" | "OLDEST" | "ALPHABETICAL";
export type SidebarView = "HOME" | "PINNED" | "RECENT" | "FOLDER";

export interface SavedContent {
  id: number;
  title: string;
  url: string;
  contentType: ContentType;
  channelName: string;
  thumbnailUrl: string;
  pinned: boolean;
  folderId: number | null;
  folderName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeNode {
  id: number;
  name: string;
  parentId: number | null;
  children: FolderTreeNode[];
}

export interface FolderOption {
  id: number;
  name: string;
  label: string;
  depth: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}

export interface ContentQueryParams {
  folderId?: number;
  search?: string;
  sort?: SortOption;
  pinned?: boolean;
  contentType?: ContentType;
}

export interface NavigationState {
  type: SidebarView;
  folderId?: number;
  label: string;
}
