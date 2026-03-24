export type ContentType = "VIDEO" | "PLAYLIST";
export type LearningStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface SavedContentDto {
  id: number;
  title: string;
  url: string;
  contentType: ContentType;
  channelName: string;
  thumbnailUrl: string;
  folderId: number | null;
  folderName: string | null;
  pinned: boolean;
  status: LearningStatus;
  progressPercent: number;
  notes: string;
  lastOpenedAt: string | null;
  lastPlaybackSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderDto {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeDto {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  children: FolderTreeDto[];
}

export interface StudyQueueItemDto {
  id: number;
  position: number;
  createdAt: string;
  content: SavedContentDto;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
