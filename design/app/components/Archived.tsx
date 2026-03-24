import { useState, useEffect } from "react";
import { getVideos, type Video } from "../lib/videos";
import { VideoCard } from "./VideoCard";
import { Archive as ArchiveIcon } from "lucide-react";

export function Archived() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const allVideos = getVideos();
    const archivedVideos = allVideos.filter((v) => v.archived);
    setVideos(archivedVideos);
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Archived
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Videos you've completed or want to revisit later
          </p>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <ArchiveIcon className="size-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400 mb-1">No archived videos</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Archive videos you've completed to keep your library organized
            </p>
          </div>
        )}
      </div>
    </div>
  );
}