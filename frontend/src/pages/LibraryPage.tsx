import { Check, ChevronDown, ChevronRight, Filter, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchBar } from "../components/ui/SearchBar";
import { SelectMenu } from "../components/ui/SelectMenu";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { SectionCard } from "../components/ui/SectionCard";
import { TagPill } from "../components/ui/TagPill";
import { VideoCard } from "../components/ui/VideoCard";
import { useContent } from "../context/ContentContext";
import { useToast } from "../context/ToastContext";
import { useWorkspaceUi } from "../context/WorkspaceUiContext";
import type { FolderTreeItem, VideoItem } from "../types/workspace";
import { getContentSearchScore } from "../utils/search";

type SortOption = "pinned" | "newest" | "oldest" | "alphabetical";
type ContentView = "all" | "videos" | "playlists";

export function LibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("pinned");
  const [contentView, setContentView] = useState<ContentView>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [continueLearningExpanded, setContinueLearningExpanded] = useState(false);
  const [dismissedContinueLearningIds, setDismissedContinueLearningIds] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const {
    videos,
    folders,
    folderTree,
    continueLearning,
    studyGoals,
    addQueueItem,
    removeQueueItem,
    studyQueue,
    pinContent,
    removeContent,
    updateWorkflow,
    loading,
    error
  } =
    useContent();
  const { showToast } = useToast();
  const { setActiveContentId } = useWorkspaceUi();

  const selectedFolderId = searchParams.get("folderId");
  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId) ?? null;
  const visibleFolderIds = useMemo(() => {
    if (!selectedFolderId) {
      return null;
    }

    const selectedNode = findFolderNode(folderTree, selectedFolderId);
    return selectedNode ? new Set(collectDescendantIds(selectedNode)) : new Set([selectedFolderId]);
  }, [folderTree, selectedFolderId]);

  const libraryTags = useMemo(() => {
    return Array.from(new Set(videos.flatMap((video) => video.tags))).sort((left, right) =>
      left.localeCompare(right)
    );
  }, [videos]);

  const filteredVideos = useMemo(() => {
    const searchedVideos = videos.filter((video) => {
      const matchesFolder = !visibleFolderIds || (video.folderId !== null && visibleFolderIds.has(video.folderId));
      const matchesSearch = search.trim().length === 0 || getContentSearchScore(search, video.title, video.channel) >= 0;
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => video.tags.includes(tag));

      return matchesFolder && matchesSearch && matchesTags;
    });

    return [...searchedVideos].sort((left, right) => {
      if (search.trim().length > 0) {
        const rightScore = getContentSearchScore(search, right.title, right.channel);
        const leftScore = getContentSearchScore(search, left.title, left.channel);
        if (leftScore !== rightScore) {
          return rightScore - leftScore;
        }
      }

      return compareVideos(left, right, sort);
    });
  }, [videos, search, selectedTags, selectedFolderId, sort, visibleFolderIds]);

  const visibleContinueLearning = useMemo(
    () => continueLearning.filter((video) => !dismissedContinueLearningIds.includes(video.id)),
    [continueLearning, dismissedContinueLearningIds]
  );
  const nearestActiveGoal = useMemo(() => {
    return [...studyGoals]
      .filter((goal) => !goal.completed)
      .sort((left, right) => left.daysRemaining - right.daysRemaining)[0] ?? null;
  }, [studyGoals]);
  const filteredVideoItems = useMemo(
    () => filteredVideos.filter((video) => video.contentType === "VIDEO"),
    [filteredVideos]
  );
  const filteredPlaylistItems = useMemo(
    () => filteredVideos.filter((video) => video.contentType === "PLAYLIST"),
    [filteredVideos]
  );
  const queueByContentId = useMemo(
    () => new Map(studyQueue.map((item) => [String(item.content.id), item.id])),
    [studyQueue]
  );

  useEffect(() => {
    setActiveContentId(filteredVideos.length > 0 ? Number(filteredVideos[0].id) : null);
  }, [filteredVideos, setActiveContentId]);

  useEffect(() => {
    if (continueLearning.length === 0) {
      setContinueLearningExpanded(false);
      setDismissedContinueLearningIds([]);
      return;
    }

    setDismissedContinueLearningIds((current) =>
      current.filter((id) => continueLearning.some((video) => video.id === id))
    );
  }, [continueLearning]);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
    );
  }

  async function handleAddToQueue(video: VideoItem) {
    try {
      await addQueueItem(Number(video.id));
      showToast({
        tone: "success",
        title: "Added to queue",
        description: video.title
      });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Queue action failed",
        description: exception instanceof Error ? exception.message : "Unable to add this item to the study queue."
      });
    }
  }

  async function handleRemoveFromQueue(video: VideoItem) {
    const queueItemId = queueByContentId.get(video.id);
    if (!queueItemId) {
      return;
    }

    try {
      await removeQueueItem(Number(queueItemId));
      showToast({
        tone: "info",
        title: "Removed from queue",
        description: video.title
      });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Queue action failed",
        description: exception instanceof Error ? exception.message : "Unable to remove this item from the study queue."
      });
    }
  }

  function handleDismissContinueLearning(video: VideoItem) {
    setDismissedContinueLearningIds((current) => [...current, video.id]);
    showToast({
      tone: "info",
      title: "Removed from Continue Learning",
      description: video.title
    });
  }

  async function handleCompleteContinueLearning(video: VideoItem) {
    try {
      await updateWorkflow(Number(video.id), {
        status: "COMPLETED",
        progressPercent: 100
      });
      setDismissedContinueLearningIds((current) => [...current, video.id]);
      showToast({
        tone: "success",
        title: "Marked complete",
        description: video.title
      });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Unable to mark complete",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    }
  }

  async function handleTogglePin(video: VideoItem) {
    try {
      const updated = await pinContent(Number(video.id));
      showToast({
        tone: "success",
        title: updated.pinned ? "Pinned" : "Unpinned",
        description: video.title
      });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Pin action failed",
        description: exception instanceof Error ? exception.message : "Unable to update this item."
      });
    }
  }

  async function handleDelete(video: VideoItem) {
    try {
      await removeContent(Number(video.id));
      showToast({
        tone: "success",
        title: "Deleted",
        description: video.title
      });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Delete failed",
        description: exception instanceof Error ? exception.message : "Unable to delete this item."
      });
    }
  }

  return (
    <div>
      <PageHeader
        title="Home"
        subtitle={selectedFolder ? `Browsing content in ${selectedFolder.name}` : undefined}
      />

      {nearestActiveGoal ? (
        <SectionCard className="mt-[18px] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-textMuted">Nearest Goal</p>
              <h2 className="mt-1 truncate text-[18px] font-semibold text-textStrong">{nearestActiveGoal.title}</h2>
              <p className="mt-1 text-[14px] text-textMuted">
                {nearestActiveGoal.daysRemaining} day{nearestActiveGoal.daysRemaining === 1 ? "" : "s"} remaining
                {nearestActiveGoal.contentTitle ? ` • ${nearestActiveGoal.contentTitle}` : ""}
              </p>
            </div>
            <Link
              to="/analytics"
              className="inline-flex min-h-[40px] items-center rounded-[12px] bg-[var(--color-surface-soft)] px-3.5 text-[14px] font-semibold text-textStrong transition hover:bg-[var(--color-surface-hover)]"
            >
              View Goal
            </Link>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard className="mt-[24px] p-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            {[
              { value: "all", label: "All" },
              { value: "videos", label: "Videos" },
              { value: "playlists", label: "Playlists" }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setContentView(option.value as ContentView)}
                className={`inline-flex min-h-[38px] items-center rounded-[12px] px-3.5 text-[14px] font-semibold transition ${
                  contentView === option.value
                    ? "bg-[#2d6cdf] text-white shadow-[0_8px_22px_rgba(45,108,223,0.22)]"
                    : "bg-[var(--color-surface-soft)] text-textMuted hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_170px_auto] items-center gap-2.5">
            <SearchBar value={search} onChange={setSearch} className="min-h-[44px]" />
            <SelectMenu
              value={sort}
              onChange={(value) => setSort(value as SortOption)}
              className="min-h-[44px]"
              options={[
                { value: "pinned", label: "Pinned First" },
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "alphabetical", label: "Alphabetical" }
              ]}
            />
            <button
              type="button"
              onClick={() => setFiltersExpanded((current) => !current)}
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[13px] px-3.5 text-[14px] font-semibold transition ${
                filtersExpanded || selectedTags.length > 0 || selectedFolder
                  ? "bg-[var(--color-surface-selected)] text-textStrong"
                  : "bg-[var(--color-surface-soft)] text-textMuted hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
              }`}
            >
              <Filter className="size-4" />
              Filter
              {selectedTags.length > 0 ? (
                <span className="rounded-full bg-[var(--color-panel)] px-2 py-0.5 text-[12px] text-textStrong">
                  {selectedTags.length}
                </span>
              ) : null}
            </button>
          </div>

          {filtersExpanded || selectedTags.length > 0 || selectedFolder ? (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {selectedFolder ? <TagPill staticStyle>{selectedFolder.name}</TagPill> : null}
              {libraryTags.map((tag) => (
                <TagPill key={tag} selected={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>
                  {tag}
                </TagPill>
              ))}
            </div>
          ) : null}
        </div>
      </SectionCard>

      {visibleContinueLearning.length > 0 ? (
        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => setContinueLearningExpanded((current) => !current)}
                className="inline-flex items-center gap-2 rounded-xl text-left transition hover:text-textStrong"
              >
                {continueLearningExpanded ? (
                  <ChevronDown className="size-5 text-textMuted" />
                ) : (
                  <ChevronRight className="size-5 text-textMuted" />
                )}
                <h2 className="m-0 text-[20px] font-semibold text-textStrong">Continue Learning</h2>
              </button>
            </div>
          </div>
          {continueLearningExpanded ? (
            <div className="grid grid-cols-3 gap-5">
              {visibleContinueLearning.slice(0, 3).map((video) => (
                <div key={video.id} className="group relative">
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-2 opacity-0 transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => void handleCompleteContinueLearning(video)}
                      className="inline-flex size-8 items-center justify-center rounded-xl bg-[rgba(15,17,21,0.72)] text-white/80 transition hover:bg-[rgba(15,17,21,0.9)] hover:text-white"
                      aria-label="Mark as completed"
                      title="Mark as completed"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismissContinueLearning(video)}
                      className="inline-flex size-8 items-center justify-center rounded-xl bg-[rgba(15,17,21,0.72)] text-white/80 transition hover:bg-[rgba(15,17,21,0.9)] hover:text-white"
                      aria-label="Remove from Continue Learning"
                      title="Remove from Continue Learning"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <VideoCard
                    video={video}
                    variant="library"
                    highlightQuery={search}
                    onAddToQueue={handleAddToQueue}
                    onRemoveFromQueue={handleRemoveFromQueue}
                    isQueued={queueByContentId.has(video.id)}
                    onTogglePin={handleTogglePin}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-3 gap-5">
          <SkeletonCard compact />
          <SkeletonCard compact />
          <SkeletonCard compact />
        </div>
      ) : null}
      {!loading && error ? (
        <EmptyStateCard
          icon={<span className="text-[42px]">!</span>}
          title="We couldn't load your library"
          description={error}
        />
      ) : null}
      {!loading && !error && videos.length === 0 ? (
        <EmptyStateCard
          icon={<span className="text-[42px]">+</span>}
          title="No content in your library yet"
          description="Paste a YouTube link to start building a focused learning library for your current topics."
        />
      ) : null}
      {!loading && !error && videos.length > 0 && filteredVideos.length === 0 ? (
        <EmptyStateCard
          icon={<span className="text-[42px]">?</span>}
          title={selectedFolder ? "No content in this folder" : "No matching content"}
          description={
            selectedFolder
              ? "Move content into this folder, clear a tag, or try a broader search."
              : "Try a broader search term, remove one of the active tags, or change the sort."
          }
        />
      ) : null}
      {!loading && !error && filteredVideos.length > 0 ? (
        <div className="grid gap-8">
          {(contentView === "all" || contentView === "videos") && filteredVideoItems.length > 0 ? (
            <section>
              <div className="mb-4">
                <h2 className="m-0 text-[20px] font-semibold text-textStrong">Videos</h2>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {filteredVideoItems.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    variant="library"
                    highlightQuery={search}
                    onAddToQueue={handleAddToQueue}
                    onRemoveFromQueue={handleRemoveFromQueue}
                    isQueued={queueByContentId.has(video.id)}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {(contentView === "all" || contentView === "playlists") && filteredPlaylistItems.length > 0 ? (
            <section>
              <div className="mb-4">
                <h2 className="m-0 text-[20px] font-semibold text-textStrong">Playlists</h2>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {filteredPlaylistItems.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    variant="library"
                    highlightQuery={search}
                    onAddToQueue={handleAddToQueue}
                    onRemoveFromQueue={handleRemoveFromQueue}
                    isQueued={queueByContentId.has(video.id)}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function findFolderNode(nodes: FolderTreeItem[], targetId: string): FolderTreeItem | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node;
    }

    const nestedMatch = findFolderNode(node.children, targetId);
    if (nestedMatch) {
      return nestedMatch;
    }
  }

  return null;
}

function collectDescendantIds(node: FolderTreeItem): string[] {
  return [node.id, ...node.children.flatMap(collectDescendantIds)];
}

function compareVideos(left: VideoItem, right: VideoItem, sort: SortOption) {
  switch (sort) {
    case "newest":
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    case "oldest":
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    case "alphabetical":
      return left.title.localeCompare(right.title);
    case "pinned":
    default:
      if (left.pinned !== right.pinned) {
        return left.pinned ? -1 : 1;
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  }
}
