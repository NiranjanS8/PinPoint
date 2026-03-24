import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchBar } from "../components/ui/SearchBar";
import { SectionCard } from "../components/ui/SectionCard";
import { TagPill } from "../components/ui/TagPill";
import { VideoCard } from "../components/ui/VideoCard";
import { useContent } from "../context/ContentContext";
import type { FolderTreeItem, VideoItem } from "../types/workspace";

type SortOption = "pinned" | "newest" | "oldest" | "alphabetical";

export function LibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("pinned");
  const [searchParams] = useSearchParams();
  const { videos, folders, folderTree, continueLearning, addQueueItem, loading, error } = useContent();

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
      const matchesSearch =
        search.trim().length === 0 ||
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.channel.toLowerCase().includes(search.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => video.tags.includes(tag));

      return matchesFolder && matchesSearch && matchesTags;
    });

    return [...searchedVideos].sort((left, right) => compareVideos(left, right, sort));
  }, [videos, search, selectedTags, selectedFolderId, sort]);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
    );
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

      <SectionCard className="mt-[34px] p-7">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="min-h-12 rounded-[14px] bg-[var(--color-surface-soft)] px-4 text-[15px] text-textStrong outline-none"
          >
            <option value="pinned">Pinned First</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div className="mt-6">
          <div className="mb-3.5 flex items-center gap-3">
            <p className="m-0 text-[16px] text-textMuted">Filter by tags:</p>
            {selectedFolder ? <TagPill staticStyle>{selectedFolder.name}</TagPill> : null}
          </div>
          <p className="mb-3.5 text-[14px] text-textMuted">
            Combine tags to narrow the library to the exact topics you want to study next.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {libraryTags.map((tag) => (
              <TagPill key={tag} selected={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>
                {tag}
              </TagPill>
            ))}
          </div>
        </div>
      </SectionCard>

      {continueLearning.length > 0 ? (
        <section className="mt-[30px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-[20px] font-semibold text-textStrong">Continue Learning</h2>
              <p className="mt-1 text-[15px] text-textMuted">
                Pick up where you left off with in-progress or recently opened content.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {continueLearning.slice(0, 3).map((video) => (
              <VideoCard key={video.id} video={video} variant="library" />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mb-[22px] mt-[30px] text-[16px] text-textMuted">
        Showing {filteredVideos.length} of {videos.length} items
      </p>

      {loading ? <p className="text-[16px] text-textMuted">Loading your library...</p> : null}
      {!loading && error ? <p className="text-[16px] text-[#b42318]">{error}</p> : null}
      {!loading && !error && videos.length === 0 ? (
        <EmptyStateCard
          icon={<span className="text-[42px]">+</span>}
          title="No content in your library yet"
          description="Add your first YouTube video or playlist to start building a study-ready library."
        />
      ) : null}
      {!loading && !error && videos.length > 0 && filteredVideos.length === 0 ? (
        <EmptyStateCard
          icon={<span className="text-[42px]">?</span>}
          title={selectedFolder ? "No content in this folder" : "No matching content"}
          description={
            selectedFolder
              ? "Move content into this folder or clear the active filters."
              : "Try a different search term or remove one of the selected tag filters."
          }
        />
      ) : null}
      {!loading && !error && filteredVideos.length > 0 ? (
        <div className="grid grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} variant="library" />
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
