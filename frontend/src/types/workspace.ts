export interface VideoItem {
  id: string;
  title: string;
  channel: string;
  duration: string;
  date: string;
  createdAt: string;
  progress: number;
  tags: string[];
  thumbnail: string;
  url: string;
  pinned: boolean;
  contentType: "VIDEO" | "PLAYLIST";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  folderId: string | null;
  folderName: string | null;
  notes: string;
  lastOpenedAt: string | null;
}

export interface FolderItem {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeItem {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  children: FolderTreeItem[];
}

export interface StudyQueueItem {
  id: string;
  position: number;
  createdAt: string;
  content: VideoItem;
}

export interface DashboardStats {
  totalVideos: number;
  totalDuration: string;
  thisWeek: number;
}

export interface AnalyticsStats {
  completionRate: string;
  completedText: string;
  watchTime: string;
  watchTimeRemaining: string;
  streak: string;
  streakText: string;
  thisWeek: string;
  thisWeekText: string;
}

export interface ProgressBreakdownItem {
  label: string;
  count: string;
  value: number;
  tone: "blue" | "neutral" | "muted";
}

export interface TopicItem {
  name: string;
  count: string;
}

export interface AnalyticsDay {
  date: string;
  minutes: number;
  intensity: number;
}

export interface TopicHeatmapItem {
  label: string;
  count: number;
  percentage: number;
}

export interface StudyGoal {
  id: string;
  title: string;
  targetDate: string;
  contentId: string | null;
  contentTitle: string | null;
  completed: boolean;
  daysRemaining: number;
  createdAt: string;
  updatedAt: string;
}
