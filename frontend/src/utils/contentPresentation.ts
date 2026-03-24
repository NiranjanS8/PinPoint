import type { SavedContentDto } from "../types/api";
import type {
  AnalyticsStats,
  DashboardStats,
  ProgressBreakdownItem,
  TopicItem,
  VideoItem
} from "../types/workspace";

const TITLE_TAG_MAP: Record<string, string[]> = {
  "introduction to quantum computing": ["quantum", "physics", "technology"],
  "advanced react patterns": ["react", "javascript", "web-dev"],
  "machine learning fundamentals": ["machine-learning", "AI", "data-science"],
  "functional programming in javascript": ["javascript", "functional-programming", "web-dev"]
};

const TITLE_DURATION_MAP: Record<string, string> = {
  "introduction to quantum computing": "15:30",
  "advanced react patterns": "28:45",
  "machine learning fundamentals": "22:18",
  "functional programming in javascript": "35:12"
};

const TITLE_PROGRESS_MAP: Record<string, number> = {
  "introduction to quantum computing": 50,
  "advanced react patterns": 75,
  "machine learning fundamentals": 25,
  "functional programming in javascript": 0
};

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
}

function deriveTags(title: string, contentType: SavedContentDto["contentType"]) {
  const mapped = TITLE_TAG_MAP[normalizeTitle(title)];
  if (mapped) {
    return mapped;
  }

  return contentType === "PLAYLIST" ? ["playlist"] : ["youtube"];
}

function deriveDuration(title: string, contentType: SavedContentDto["contentType"]) {
  const mapped = TITLE_DURATION_MAP[normalizeTitle(title)];
  if (mapped) {
    return mapped;
  }

  return contentType === "PLAYLIST" ? "Playlist" : "--:--";
}

function deriveProgress(title: string) {
  return TITLE_PROGRESS_MAP[normalizeTitle(title)] ?? 0;
}

export function toVideoItem(content: SavedContentDto): VideoItem {
  return {
    id: String(content.id),
    title: content.title,
    channel: content.channelName,
    duration: deriveDuration(content.title, content.contentType),
    date: formatDate(content.createdAt),
    progress: deriveProgress(content.title),
    tags: deriveTags(content.title, content.contentType),
    thumbnail: content.thumbnailUrl,
    url: content.url,
    pinned: content.pinned,
    contentType: content.contentType
  };
}

export function toDashboardStats(items: VideoItem[]): DashboardStats {
  return {
    totalVideos: items.length,
    totalDuration: "1h 41m",
    thisWeek: items.filter((item) => {
      const createdAt = new Date(item.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt >= weekAgo;
    }).length
  };
}

export function toAnalyticsStats(items: VideoItem[]): AnalyticsStats {
  const completed = items.filter((item) => item.progress === 100).length;
  const completionRate = items.length === 0 ? 0 : Math.round((completed / items.length) * 100);

  return {
    completionRate: `${completionRate}%`,
    completedText: `${completed} of ${items.length} completed`,
    watchTime: "1h",
    watchTimeRemaining: "1h remaining",
    streak: "7 days",
    streakText: "Keep it up!",
    thisWeek: String(
      items.filter((item) => {
        const createdAt = new Date(item.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt >= weekAgo;
      }).length
    ),
    thisWeekText: "videos added"
  };
}

export function toProgressBreakdown(items: VideoItem[]): ProgressBreakdownItem[] {
  const completed = items.filter((item) => item.progress === 100).length;
  const inProgress = items.filter((item) => item.progress > 0 && item.progress < 100).length;
  const notStarted = items.filter((item) => item.progress === 0).length;
  const total = items.length || 1;

  return [
    {
      label: "Completed",
      count: `${completed} videos`,
      value: Math.round((completed / total) * 100),
      tone: "neutral"
    },
    {
      label: "In Progress",
      count: `${inProgress} videos`,
      value: Math.round((inProgress / total) * 100),
      tone: "blue"
    },
    {
      label: "Not Started",
      count: `${notStarted} videos`,
      value: Math.round((notStarted / total) * 100),
      tone: "muted"
    }
  ];
}

export function toTopTopics(items: VideoItem[]): TopicItem[] {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count: `${count} videos`
    }));
}
