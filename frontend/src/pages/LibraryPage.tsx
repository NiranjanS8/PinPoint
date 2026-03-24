import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchBar } from "../components/ui/SearchBar";
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

export function LibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("pinned");
  const [continueLearningExpanded, setContinueLearningExpanded] = useState(false);
  const [dismissedContinueLearningIds, setDismissedContinueLearningIds] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const { videos, folders, folderTree, continueLearning, addQueueItem, loading, error } = useContent();
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

  useEffect(() => {
    setActiveContentId(filteredVideos.length > 0 ? Number(filteredVideos[0].id) : null);
  }, [filteredVideos, setActiveContentId]);

  useEffect(() => {
    if (continueLearning.length === 0) {
      setContinueLearningExpanded(false);
      setDismissedContinueLearningIds([]);
      return;
    }

    setContinueLearningExpanded(true);
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

  function handleDismissContinueLearning(video: VideoItem) {
    setDismissedContinueLearningIds((current) => [...current, video.id]);
    showToast({
      tone: "info",
      title: "Removed from Continue Learning",
      description: video.title
    });
  }

  return (
    <div>
      <PageHeader
        title="Library"
        subtitle={
          selectedFolder
            ? `Browsing content in ${selectedFolder.name}`
            : "All your saved learning content"
        }
      />

      <SectionCard className="mt-[28px] p-6">
        <div className="grid gap-5">
          <div className="grid grid-cols-[minmax(0,1fr)_180px] items-center gap-4">
            <SearchBar value={search} onChange={setSearch} className="min-h-[50px]" />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="min-h-[50px] rounded-[14px] bg-[var(--color-surface-soft)] px-4 text-[15px] text-textStrong outline-none transition hover:bg-mutedPanel"
            >
              <option value="pinned">Pinned First</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
            <p className="m-0 text-[16px] text-textMuted">Filter by tags:</p>
            {selectedFolder ? <TagPill staticStyle>{selectedFolder.name}</TagPill> : null}
            </div>
            <p className="text-[13px] text-textMuted">
              Tip: combine tags and fuzzy search to quickly narrow the next lesson you want to work on.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {libraryTags.map((tag) => (
                <TagPill key={tag} selected={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>
                  {tag}
                </TagPill>
              ))}
            </div>
          </div>
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
                <div key={video.id} className="relative">
                  <button
                    type="button"
                    onClick={() => handleDismissContinueLearning(video)}
                    className="absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-xl bg-[rgba(15,17,21,0.72)] text-white/80 transition hover:bg-[rgba(15,17,21,0.9)] hover:text-white"
                    aria-label="Remove from Continue Learning"
                    title="Remove from Continue Learning"
                  >
                    <X className="size-4" />
                  </button>
                  <VideoCard
                    video={video}
                    variant="library"
                    highlightQuery={search}
                    onAddToQueue={handleAddToQueue}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <p className="mb-4 mt-7 text-[15px] text-textMuted">
        Showing {filteredVideos.length} of {videos.length} items
      </p>

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
        <div className="grid grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              variant="library"
              highlightQuery={search}
              onAddToQueue={handleAddToQueue}
            />
          ))}
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
