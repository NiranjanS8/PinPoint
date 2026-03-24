export interface VideoItem {
  id: string;
  title: string;
  channel: string;
  duration: string;
  date: string;
  progress: number;
  tags: string[];
  thumbnail: string;
  url: string;
  pinned: boolean;
  contentType: "VIDEO" | "PLAYLIST";
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
