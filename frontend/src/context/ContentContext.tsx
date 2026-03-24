import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { createContent, deleteContent, fetchContent, togglePinned } from "../services/contentApi";
import { toAnalyticsStats, toDashboardStats, toProgressBreakdown, toTopTopics, toVideoItem } from "../utils/contentPresentation";
import type { SavedContentDto } from "../types/api";
import type { VideoItem } from "../types/workspace";

interface ContentContextValue {
  items: SavedContentDto[];
  videos: VideoItem[];
  loading: boolean;
  error: string | null;
  dashboardStats: ReturnType<typeof toDashboardStats>;
  analyticsStats: ReturnType<typeof toAnalyticsStats>;
  progressBreakdown: ReturnType<typeof toProgressBreakdown>;
  topTopics: ReturnType<typeof toTopTopics>;
  loadContent: () => Promise<void>;
  addContent: (url: string) => Promise<void>;
  pinContent: (id: number) => Promise<SavedContentDto>;
  removeContent: (id: number) => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<SavedContentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchContent();
      setItems(response);
      setError(null);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const addContent = useCallback(async (url: string) => {
    const created = await createContent(url);
    setItems((current) => [created, ...current].sort(sortContent));
    setError(null);
  }, []);

  const pinContent = useCallback(async (id: number) => {
    const updated = await togglePinned(id);
    setItems((current) =>
      current
        .map((item) => (item.id === updated.id ? updated : item))
        .sort(sortContent)
    );
    setError(null);
    return updated;
  }, []);

  const removeContent = useCallback(async (id: number) => {
    await deleteContent(id);
    setItems((current) => current.filter((item) => item.id !== id));
    setError(null);
  }, []);

  const videos = useMemo(() => items.map(toVideoItem), [items]);
  const dashboardStats = useMemo(() => toDashboardStats(videos), [videos]);
  const analyticsStats = useMemo(() => toAnalyticsStats(videos), [videos]);
  const progressBreakdown = useMemo(() => toProgressBreakdown(videos), [videos]);
  const topTopics = useMemo(() => toTopTopics(videos), [videos]);

  const value = useMemo<ContentContextValue>(
    () => ({
      items,
      videos,
      loading,
      error,
      dashboardStats,
      analyticsStats,
      progressBreakdown,
      topTopics,
      loadContent,
      addContent,
      pinContent,
      removeContent
    }),
    [
      items,
      videos,
      loading,
      error,
      dashboardStats,
      analyticsStats,
      progressBreakdown,
      topTopics,
      loadContent,
      addContent,
      pinContent,
      removeContent
    ]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }

  return context;
}

function sortContent(left: SavedContentDto, right: SavedContentDto) {
  if (left.pinned !== right.pinned) {
    return left.pinned ? -1 : 1;
  }

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}
