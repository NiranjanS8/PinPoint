import { useMemo, useState } from "react";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchBar } from "../components/ui/SearchBar";
import { SectionCard } from "../components/ui/SectionCard";
import { TagPill } from "../components/ui/TagPill";
import { VideoCard } from "../components/ui/VideoCard";
import { useContent } from "../context/ContentContext";

export function LibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { videos, loading, error } = useContent();

  const libraryTags = useMemo(() => {
    return Array.from(new Set(videos.flatMap((video) => video.tags))).sort((left, right) =>
      left.localeCompare(right)
    );
  }, [videos]);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch =
        search.trim().length === 0 ||
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.channel.toLowerCase().includes(search.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => video.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [search, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
    );
  }

  return (
    <div>
      <PageHeader title="Library" subtitle="All your saved learning content" />

      <SectionCard className="mt-[34px] p-7">
        <SearchBar value={search} onChange={setSearch} />
        <div className="mt-6">
          <p className="m-0 mb-3.5 text-[16px] text-textMuted">Filter by tags:</p>
          <div className="flex flex-wrap gap-2.5">
            {libraryTags.map((tag) => (
              <TagPill key={tag} selected={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>
                {tag}
              </TagPill>
            ))}
          </div>
        </div>
      </SectionCard>

      <p className="mb-[22px] mt-[30px] text-[16px] text-textMuted">
        Showing {filteredVideos.length} of {videos.length} videos
      </p>

      {loading ? <p className="text-[16px] text-textMuted">Loading your library...</p> : null}
      {!loading && error ? <p className="text-[16px] text-[#b42318]">{error}</p> : null}
      {!loading && !error && videos.length === 0 ? (
        <EmptyStateCard
          icon={<span className="text-[42px]">+</span>}
          title="No videos in your library yet"
          description="Add a YouTube link to see your saved content here."
        />
      ) : null}
      {!loading && !error && videos.length > 0 && filteredVideos.length === 0 ? (
        <EmptyStateCard
          icon={<span className="text-[42px]">?</span>}
          title="No matching videos"
          description="Try a different search term or remove one of the selected tag filters."
        />
      ) : null}
      {!loading && !error && filteredVideos.length > 0 ? (
        <div className="grid grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
