export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  youtubeId: string;
  thumbnail: string;
  tags: string[];
  archived: boolean;
  dateAdded: string;
  duration: string;
  channel: string;
  notes: VideoNote[];
  watchProgress: number; // percentage 0-100
  lastWatched?: string;
  durationSeconds: number;
}

export interface VideoNote {
  id: string;
  timestamp: number; // seconds
  content: string;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  videoIds: string[];
  createdAt: string;
  color: string;
}

// Mock data for demonstration
export const mockVideos: Video[] = [
  {
    id: "1",
    title: "Introduction to Quantum Computing",
    description: "A comprehensive guide to understanding quantum computing basics and its applications in modern technology.",
    url: "https://www.youtube.com/watch?v=JhHMJCUmq28",
    youtubeId: "JhHMJCUmq28",
    thumbnail: "https://img.youtube.com/vi/JhHMJCUmq28/maxresdefault.jpg",
    tags: ["quantum", "physics", "technology"],
    archived: false,
    dateAdded: "2026-03-20T10:00:00Z",
    duration: "15:30",
    channel: "Quantum Academy",
    notes: [
      {
        id: "1",
        timestamp: 120,
        content: "Quantum bits are the fundamental units of quantum information.",
        createdAt: "2026-03-20T10:05:00Z"
      }
    ],
    watchProgress: 50,
    lastWatched: "2026-03-20T10:10:00Z",
    durationSeconds: 930
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description: "Learn modern React patterns including hooks, context, and component composition for scalable applications.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    tags: ["react", "javascript", "web-dev"],
    archived: false,
    dateAdded: "2026-03-18T14:30:00Z",
    duration: "28:45",
    channel: "Dev Mastery",
    notes: [
      {
        id: "2",
        timestamp: 180,
        content: "Context API is useful for passing data through the component tree without having to pass props down manually at every level.",
        createdAt: "2026-03-18T14:35:00Z"
      }
    ],
    watchProgress: 75,
    lastWatched: "2026-03-18T14:40:00Z",
    durationSeconds: 1725
  },
  {
    id: "3",
    title: "Machine Learning Fundamentals",
    description: "Understand the core concepts of machine learning, neural networks, and AI applications.",
    url: "https://www.youtube.com/watch?v=aircAruvnKk",
    youtubeId: "aircAruvnKk",
    thumbnail: "https://img.youtube.com/vi/aircAruvnKk/maxresdefault.jpg",
    tags: ["machine-learning", "AI", "data-science"],
    archived: false,
    dateAdded: "2026-03-15T09:15:00Z",
    duration: "22:18",
    channel: "3Blue1Brown",
    notes: [
      {
        id: "3",
        timestamp: 130,
        content: "Neural networks are a set of algorithms, modeled loosely after the human brain, that are designed to recognize patterns.",
        createdAt: "2026-03-15T09:20:00Z"
      }
    ],
    watchProgress: 25,
    lastWatched: "2026-03-15T09:25:00Z",
    durationSeconds: 1338
  },
  {
    id: "4",
    title: "System Design Interview Prep",
    description: "Master system design concepts for technical interviews at top tech companies.",
    url: "https://www.youtube.com/watch?v=UzLMhqg3_Wc",
    youtubeId: "UzLMhqg3_Wc",
    thumbnail: "https://img.youtube.com/vi/UzLMhqg3_Wc/maxresdefault.jpg",
    tags: ["system-design", "interviews", "software-engineering"],
    archived: true,
    dateAdded: "2026-03-10T16:45:00Z",
    duration: "42:30",
    channel: "Tech Interview Pro",
    notes: [
      {
        id: "4",
        timestamp: 250,
        content: "System design involves creating a high-level architecture for a system that meets the requirements of the problem.",
        createdAt: "2026-03-10T16:50:00Z"
      }
    ],
    watchProgress: 100,
    lastWatched: "2026-03-10T16:55:00Z",
    durationSeconds: 2550
  },
  {
    id: "5",
    title: "Functional Programming in JavaScript",
    description: "Explore functional programming paradigms and how to apply them in JavaScript development.",
    url: "https://www.youtube.com/watch?v=e-5obm1G_FY",
    youtubeId: "e-5obm1G_FY",
    thumbnail: "https://img.youtube.com/vi/e-5obm1G_FY/maxresdefault.jpg",
    tags: ["javascript", "functional-programming", "web-dev"],
    archived: false,
    dateAdded: "2026-03-12T11:20:00Z",
    duration: "35:12",
    channel: "Fun Fun Function",
    notes: [
      {
        id: "5",
        timestamp: 210,
        content: "Functional programming emphasizes the use of pure functions and immutability.",
        createdAt: "2026-03-12T11:25:00Z"
      }
    ],
    watchProgress: 0,
    lastWatched: "2026-03-12T11:30:00Z",
    durationSeconds: 2112
  },
  {
    id: "6",
    title: "Understanding Blockchain Technology",
    description: "A deep dive into blockchain technology, cryptocurrencies, and decentralized systems.",
    url: "https://www.youtube.com/watch?v=SSo_EIwHSd4",
    youtubeId: "SSo_EIwHSd4",
    thumbnail: "https://img.youtube.com/vi/SSo_EIwHSd4/maxresdefault.jpg",
    tags: ["blockchain", "cryptocurrency", "technology"],
    archived: true,
    dateAdded: "2026-03-08T13:00:00Z",
    duration: "18:55",
    channel: "Simply Explained",
    notes: [
      {
        id: "6",
        timestamp: 100,
        content: "Blockchain is a distributed ledger technology that records transactions across many computers in such a way that the registered transactions cannot be altered retroactively.",
        createdAt: "2026-03-08T13:05:00Z"
      }
    ],
    watchProgress: 100,
    lastWatched: "2026-03-08T13:10:00Z",
    durationSeconds: 1135
  }
];

// localStorage helpers
const STORAGE_KEY = 'pinpoint_videos';

export const getVideos = (): Video[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with mock data on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockVideos));
  return mockVideos;
};

export const saveVideos = (videos: Video[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
};

export const addVideo = (video: Omit<Video, 'id' | 'dateAdded'>): Video => {
  const videos = getVideos();
  const newVideo: Video = {
    ...video,
    id: Date.now().toString(),
    dateAdded: new Date().toISOString(),
  };
  videos.unshift(newVideo);
  saveVideos(videos);
  return newVideo;
};

export const updateVideo = (id: string, updates: Partial<Video>): void => {
  const videos = getVideos();
  const index = videos.findIndex(v => v.id === id);
  if (index !== -1) {
    videos[index] = { ...videos[index], ...updates };
    saveVideos(videos);
  }
};

export const deleteVideo = (id: string): void => {
  const videos = getVideos();
  const filtered = videos.filter(v => v.id !== id);
  saveVideos(filtered);
};

export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};