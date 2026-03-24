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
  tags: string;
  lastOpenedAt: string | null;
  lastPlaybackSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderDto {
  id: number;
  name: string;
  description: string | null;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeDto {
  id: number;
  name: string;
  description: string | null;
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

export interface AnalyticsDayDto {
  date: string;
  minutes: number;
  intensity: number;
}

export interface TopicHeatmapItemDto {
  label: string;
  count: number;
  percentage: number;
}

export interface AnalyticsOverviewDto {
  totalFocusMinutes: number;
  currentStreakDays: number;
  longestStreakDays: number;
  contributionDays: AnalyticsDayDto[];
  topicHeatmap: TopicHeatmapItemDto[];
}

export interface StudyGoalDto {
  id: number;
  title: string;
  targetDate: string;
  contentId: number | null;
  contentTitle: string | null;
  completed: boolean;
  daysRemaining: number;
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
