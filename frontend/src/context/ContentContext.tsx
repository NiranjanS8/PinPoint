import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import {
  createContent,
  deleteContent,
  fetchContent,
  fetchContinueLearning,
  fetchRecentlyWatched,
  markContentOpened,
  togglePinned,
  updateContent,
  updateContentProgress,
  updateContentFolder
} from "../services/contentApi";
import {
  createFolder,
  deleteFolder,
  fetchFolders,
  fetchFolderTree,
  updateFolder
} from "../services/folderApi";
import { addToStudyQueue, fetchStudyQueue, removeFromStudyQueue } from "../services/studyQueueApi";
import {
  toAnalyticsStats,
  toFolderItem,
  toFolderTreeItem,
  toProgressBreakdown,
  toStudyQueueItem,
  toTopTopics,
  toVideoItem
} from "../utils/contentPresentation";
import type { FolderDto, LearningStatus, SavedContentDto } from "../types/api";
import type { FolderItem, FolderTreeItem, StudyQueueItem, VideoItem } from "../types/workspace";

interface ContentContextValue {
  items: SavedContentDto[];
  videos: VideoItem[];
  folders: FolderItem[];
  folderTree: FolderTreeItem[];
  continueLearning: VideoItem[];
  recentlyWatched: VideoItem[];
  studyQueue: StudyQueueItem[];
  loading: boolean;
  error: string | null;
  analyticsStats: ReturnType<typeof toAnalyticsStats>;
  progressBreakdown: ReturnType<typeof toProgressBreakdown>;
  topTopics: ReturnType<typeof toTopTopics>;
  loadContent: () => Promise<void>;
  loadFolders: () => Promise<void>;
  loadStudyQueue: () => Promise<void>;
  addContent: (url: string) => Promise<void>;
  pinContent: (id: number) => Promise<SavedContentDto>;
  updateWorkflow: (
    id: number,
    payload: { status?: LearningStatus; progressPercent?: number; notes?: string }
  ) => Promise<SavedContentDto>;
  updatePlaybackProgress: (
    id: number,
    payload: { status?: LearningStatus; progressPercent?: number; lastPlaybackSeconds?: number }
  ) => Promise<SavedContentDto>;
  markOpened: (id: number) => Promise<SavedContentDto>;
  assignFolder: (contentId: number, folderId: number | null) => Promise<SavedContentDto>;
  removeContent: (id: number) => Promise<void>;
  createFolder: (name: string, parentId: number | null) => Promise<FolderDto>;
  renameFolder: (id: number, name: string, parentId: number | null) => Promise<FolderDto>;
  removeFolder: (id: number) => Promise<void>;
  addQueueItem: (contentId: number) => Promise<void>;
  removeQueueItem: (queueItemId: number) => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<SavedContentDto[]>([]);
  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [folderTree, setFolderTree] = useState<FolderTreeItem[]>([]);
  const [continueLearningItems, setContinueLearningItems] = useState<SavedContentDto[]>([]);
  const [recentlyWatchedItems, setRecentlyWatchedItems] = useState<SavedContentDto[]>([]);
  const [studyQueueItems, setStudyQueueItems] = useState<StudyQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    const response = await fetchContent();
    setItems(response);
  }, []);

  const loadFolders = useCallback(async () => {
    const [flatFolders, nestedFolders] = await Promise.all([fetchFolders(), fetchFolderTree()]);
    setFolders(flatFolders);
    setFolderTree(nestedFolders.map(toFolderTreeItem));
  }, []);

  const loadContinueLearning = useCallback(async () => {
    const response = await fetchContinueLearning();
    setContinueLearningItems(response);
  }, []);

  const loadRecentlyWatched = useCallback(async () => {
    const response = await fetchRecentlyWatched();
    setRecentlyWatchedItems(response);
  }, []);

  const loadStudyQueue = useCallback(async () => {
    const response = await fetchStudyQueue();
    setStudyQueueItems(response.map(toStudyQueueItem));
  }, []);

  const refreshWorkflowCollections = useCallback(async () => {
    await Promise.all([loadContinueLearning(), loadRecentlyWatched(), loadStudyQueue()]);
  }, [loadContinueLearning, loadRecentlyWatched, loadStudyQueue]);

  useEffect(() => {
    async function initializeWorkspace() {
      setLoading(true);
      try {
        await Promise.all([loadContent(), loadFolders(), refreshWorkflowCollections()]);
        setError(null);
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : "Failed to load workspace");
      } finally {
        setLoading(false);
      }
    }

    void initializeWorkspace();
  }, [loadContent, loadFolders, refreshWorkflowCollections]);

  const addContent = useCallback(async (url: string) => {
    const created = await createContent(url);
    setItems((current) => [created, ...current].sort(sortContent));
    setError(null);
  }, []);

  const pinContent = useCallback(
    async (id: number) => {
      const updated = await togglePinned(id);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)).sort(sortContent));
      await refreshWorkflowCollections();
      setError(null);
      return updated;
    },
    [refreshWorkflowCollections]
  );

  const updateWorkflow = useCallback(
    async (
      id: number,
      payload: { status?: LearningStatus; progressPercent?: number; notes?: string }
    ) => {
      const updated = await updateContent(id, payload);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)).sort(sortContent));
      await refreshWorkflowCollections();
      setError(null);
      return updated;
    },
    [refreshWorkflowCollections]
  );

  const updatePlayback = useCallback(
    async (
      id: number,
      payload: { status?: LearningStatus; progressPercent?: number; lastPlaybackSeconds?: number }
    ) => {
      const updated = await updateContentProgress(id, payload);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)).sort(sortContent));
      await refreshWorkflowCollections();
      setError(null);
      return updated;
    },
    [refreshWorkflowCollections]
  );

  const markOpened = useCallback(
    async (id: number) => {
      const updated = await markContentOpened(id);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)).sort(sortContent));
      await refreshWorkflowCollections();
      setError(null);
      return updated;
    },
    [refreshWorkflowCollections]
  );

  const assignFolder = useCallback(async (contentId: number, folderId: number | null) => {
    const updated = await updateContentFolder(contentId, folderId);
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)).sort(sortContent));
    setError(null);
    return updated;
  }, []);

  const removeContent = useCallback(
    async (id: number) => {
      await deleteContent(id);
      setItems((current) => current.filter((item) => item.id !== id));
      await refreshWorkflowCollections();
      setError(null);
    },
    [refreshWorkflowCollections]
  );

  const handleCreateFolder = useCallback(
    async (name: string, parentId: number | null) => {
      const created = await createFolder(name, parentId);
      await loadFolders();
      return created;
    },
    [loadFolders]
  );

  const handleRenameFolder = useCallback(
    async (id: number, name: string, parentId: number | null) => {
      const updated = await updateFolder(id, name, parentId);
      await loadFolders();
      return updated;
    },
    [loadFolders]
  );

  const handleRemoveFolder = useCallback(
    async (id: number) => {
      await deleteFolder(id);
      setItems((current) =>
        current.map((item) => (item.folderId === id ? { ...item, folderId: null, folderName: null } : item))
      );
      await loadFolders();
    },
    [loadFolders]
  );

  const addQueueItem = useCallback(
    async (contentId: number) => {
      await addToStudyQueue(contentId);
      await loadStudyQueue();
    },
    [loadStudyQueue]
  );

  const removeQueueItem = useCallback(
    async (queueItemId: number) => {
      await removeFromStudyQueue(queueItemId);
      await loadStudyQueue();
    },
    [loadStudyQueue]
  );

  const videos = useMemo(() => items.map(toVideoItem), [items]);
  const continueLearning = useMemo(() => continueLearningItems.map(toVideoItem), [continueLearningItems]);
  const recentlyWatched = useMemo(() => recentlyWatchedItems.map(toVideoItem), [recentlyWatchedItems]);
  const analyticsStats = useMemo(() => toAnalyticsStats(videos), [videos]);
  const progressBreakdown = useMemo(() => toProgressBreakdown(videos), [videos]);
  const topTopics = useMemo(() => toTopTopics(videos), [videos]);
  const mappedFolders = useMemo(() => folders.map(toFolderItem), [folders]);

  const value = useMemo<ContentContextValue>(
    () => ({
      items,
      videos,
      folders: mappedFolders,
      folderTree,
      continueLearning,
      recentlyWatched,
      studyQueue: studyQueueItems,
      loading,
      error,
      analyticsStats,
      progressBreakdown,
      topTopics,
      loadContent: async () => {
        setLoading(true);
        try {
          await Promise.all([loadContent(), refreshWorkflowCollections()]);
          setError(null);
        } catch (exception) {
          setError(exception instanceof Error ? exception.message : "Failed to load content");
        } finally {
          setLoading(false);
        }
      },
      loadFolders: async () => {
        setLoading(true);
        try {
          await loadFolders();
          setError(null);
        } catch (exception) {
          setError(exception instanceof Error ? exception.message : "Failed to load folders");
        } finally {
          setLoading(false);
        }
      },
      loadStudyQueue: async () => {
        await loadStudyQueue();
      },
      addContent,
      pinContent,
      updateWorkflow,
      updatePlaybackProgress: updatePlayback,
      markOpened,
      assignFolder,
      removeContent,
      createFolder: handleCreateFolder,
      renameFolder: handleRenameFolder,
      removeFolder: handleRemoveFolder,
      addQueueItem,
      removeQueueItem
    }),
    [
      items,
      videos,
      mappedFolders,
      folderTree,
      continueLearning,
      recentlyWatched,
      studyQueueItems,
      loading,
      error,
      analyticsStats,
      progressBreakdown,
      topTopics,
      loadContent,
      loadFolders,
      loadStudyQueue,
      refreshWorkflowCollections,
      addContent,
      pinContent,
      updateWorkflow,
      updatePlayback,
      markOpened,
      assignFolder,
      removeContent,
      handleCreateFolder,
      handleRenameFolder,
      handleRemoveFolder,
      addQueueItem,
      removeQueueItem
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
