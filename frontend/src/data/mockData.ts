import type { AnalyticsStats, DashboardStats, ProgressBreakdownItem, TopicItem, VideoItem } from "../types/workspace";

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const quantumThumb = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
  <defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#2b173d"/><stop offset="100%" stop-color="#d31d4f"/></linearGradient></defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <polygon points="0,220 230,120 180,310 320,380 150,420" fill="#5d3b97" opacity="0.55"/>
  <rect x="420" y="160" width="320" height="360" rx="34" fill="#fedfca" stroke="#00a4d6" stroke-width="16"/>
  <circle cx="520" cy="255" r="18" fill="none" stroke="#18b7da" stroke-width="9"/>
  <circle cx="637" cy="255" r="18" fill="none" stroke="#18b7da" stroke-width="9"/>
  <circle cx="520" cy="340" r="16" fill="none" stroke="#ff9979" stroke-width="9"/>
  <circle cx="637" cy="340" r="16" fill="none" stroke="#ff9979" stroke-width="9"/>
  <text x="52" y="92" fill="#ffffff" font-size="88" font-family="Segoe UI, Arial" font-weight="700">QUANTUM COMPUTER</text>
</svg>
`);

const reactThumb = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
  <defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#314872"/><stop offset="100%" stop-color="#d6a2b8"/></linearGradient></defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="0" y="0" width="610" height="720" fill="#27406d" opacity="0.45"/>
  <text x="48" y="144" fill="#ffffff" font-size="78" font-family="Segoe UI, Arial" font-weight="700">R I C K</text>
  <text x="48" y="234" fill="#ffffff" font-size="78" font-family="Segoe UI, Arial" font-weight="700">A S T L E Y</text>
  <text x="48" y="332" fill="#e3e6ec" font-size="44" font-family="Segoe UI, Arial" letter-spacing="12">NEVER GONNA</text>
  <text x="48" y="392" fill="#e3e6ec" font-size="44" font-family="Segoe UI, Arial" letter-spacing="12">GIVE YOU UP</text>
  <text x="58" y="664" fill="#ffffff" font-size="86" font-family="Segoe UI, Arial" font-weight="700">4K</text>
</svg>
`);

const mlThumb = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#050607"/>
  <rect x="58" y="98" width="154" height="518" fill="#111318"/>
  <g fill="#ffffff"><rect x="88" y="162" width="18" height="256"/><polygon points="106,162 146,146 146,434 106,418"/></g>
  <g stroke-width="4"><g stroke="#2cc8ff" opacity="0.8"><path d="M260 184 468 260 700 180 944 286 1120 216"/><path d="M260 274 468 198 700 318 944 200 1120 340"/><path d="M260 356 468 422 700 244 944 374 1120 454"/></g><g stroke="#ff5a1f" opacity="0.72"><path d="M260 184 468 198 700 244 944 200 1120 216"/><path d="M260 274 468 260 700 318 944 286 1120 340"/><path d="M260 356 468 340 700 372 944 374 1120 380"/></g></g>
  <text x="1170" y="348" fill="#ffffff" font-size="46" font-family="Segoe UI, Arial">3</text>
</svg>
`);

const functionalThumb = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
  <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#54613d"/><stop offset="100%" stop-color="#2c2f33"/></linearGradient>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="820" y="132" width="196" height="240" rx="12" fill="#6e3f7f"/>
  <text x="860" y="260" fill="#ffd348" font-size="128" font-family="Segoe UI, Arial" font-weight="700">JS</text>
</svg>
`);

export const videos: VideoItem[] = [
  {
    id: "1",
    title: "Introduction to Quantum Computing",
    channel: "Quantum Academy",
    duration: "15:30",
    date: "3/20/2026",
    createdAt: "2026-03-20T00:00:00",
    progress: 50,
    tags: ["quantum", "physics", "technology"],
    thumbnail: quantumThumb,
    url: "https://www.youtube.com/watch?v=JhHMJCUmq28",
    pinned: false,
    contentType: "VIDEO",
    status: "IN_PROGRESS",
    folderId: null,
    folderName: null,
    notes: "Review the basic model of qubits and superposition.",
    lastOpenedAt: "2026-03-24T09:30:00"
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    channel: "Dev Mastery",
    duration: "28:45",
    date: "3/18/2026",
    createdAt: "2026-03-18T00:00:00",
    progress: 75,
    tags: ["react", "javascript", "web-dev"],
    thumbnail: reactThumb,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    pinned: true,
    contentType: "VIDEO",
    status: "IN_PROGRESS",
    folderId: null,
    folderName: null,
    notes: "Revisit the compound component pattern example.",
    lastOpenedAt: "2026-03-23T20:15:00"
  },
  {
    id: "3",
    title: "Machine Learning Fundamentals",
    channel: "3Blue1Brown",
    duration: "22:18",
    date: "3/15/2026",
    createdAt: "2026-03-15T00:00:00",
    progress: 25,
    tags: ["machine-learning", "AI", "data-science"],
    thumbnail: mlThumb,
    url: "https://www.youtube.com/watch?v=aircAruvnKk",
    pinned: false,
    contentType: "VIDEO",
    status: "IN_PROGRESS",
    folderId: null,
    folderName: null,
    notes: "",
    lastOpenedAt: "2026-03-22T18:00:00"
  },
  {
    id: "4",
    title: "Functional Programming in JavaScript",
    channel: "Fun Fun Function",
    duration: "35:12",
    date: "3/12/2026",
    createdAt: "2026-03-12T00:00:00",
    progress: 0,
    tags: ["javascript", "functional-programming", "web-dev"],
    thumbnail: functionalThumb,
    url: "https://www.youtube.com/watch?v=e-5obm1G_FY",
    pinned: false,
    contentType: "VIDEO",
    status: "NOT_STARTED",
    folderId: null,
    folderName: null,
    notes: "",
    lastOpenedAt: null
  }
];

export const dashboardStats: DashboardStats = {
  totalVideos: 4,
  totalDuration: "1h 41m",
  thisWeek: 2
};

export const libraryTags = [
  "AI",
  "data-science",
  "functional-programming",
  "javascript",
  "machine-learning",
  "physics",
  "quantum",
  "react",
  "technology",
  "web-dev"
];

export const analyticsStats: AnalyticsStats = {
  completionRate: "0%",
  completedText: "0 of 4 completed",
  watchTime: "1h",
  watchTimeRemaining: "1h remaining",
  streak: "7 days",
  streakText: "Keep it up!",
  thisWeek: "2",
  thisWeekText: "videos added"
};

export const progressBreakdown: ProgressBreakdownItem[] = [
  { label: "Completed", count: "0 videos", value: 0, tone: "neutral" },
  { label: "In Progress", count: "3 videos", value: 75, tone: "blue" },
  { label: "Not Started", count: "1 videos", value: 25, tone: "muted" }
];

export const topTopics: TopicItem[] = [
  { name: "javascript", count: "2 videos" },
  { name: "web-dev", count: "2 videos" },
  { name: "quantum", count: "1 videos" },
  { name: "physics", count: "1 videos" },
  { name: "technology", count: "1 videos" }
];
