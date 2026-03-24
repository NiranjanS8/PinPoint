import { useState, useEffect } from "react";
import { getVideos, type Video } from "../lib/videos";
import { VideoCard } from "./VideoCard";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, X } from "lucide-react";
import { Button } from "./ui/button";

export function Library() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const allVideos = getVideos();
    const activeVideos = allVideos.filter((v) => !v.archived);
    setVideos(activeVideos);
    setFilteredVideos(activeVideos);

    // Extract all unique tags
    const tags = new Set<string>();
    activeVideos.forEach((video) => {
      video.tags.forEach((tag) => tags.add(tag));
    });
    setAllTags(Array.from(tags).sort());
  }, []);

  useEffect(() => {
    let filtered = videos;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.channel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((video) =>
        selectedTags.every((tag) => video.tags.includes(tag))
      );
    }

    setFilteredVideos(filtered);
  }, [searchQuery, selectedTags, videos]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Library</h1>
          <p className="text-zinc-600 dark:text-zinc-400">All your saved learning content</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {(searchQuery || selectedTags.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="size-4" />
                Clear
              </Button>
            )}
          </div>

          {allTags.length > 0 && (
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Filter by tags:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedTags.includes(tag)
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Showing {filteredVideos.length} of {videos.length} videos
        </div>

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-1">No videos found</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}