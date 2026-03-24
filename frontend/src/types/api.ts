export type ContentType = "VIDEO" | "PLAYLIST";

export interface SavedContentDto {
  id: number;
  title: string;
  url: string;
  contentType: ContentType;
  channelName: string;
  thumbnailUrl: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
