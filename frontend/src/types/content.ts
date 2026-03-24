export type ContentType = "VIDEO" | "PLAYLIST";

export type FilterType = "ALL" | "VIDEO" | "PLAYLIST" | "PINNED";

export interface SavedContent {
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

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}
