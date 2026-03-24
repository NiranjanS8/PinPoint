import { useState, useEffect } from "react";
import { getVideos, type Video } from "../lib/videos";
import { VideoCard } from "./VideoCard";
import { Clock, Video as VideoIcon } from "lucide-react";

export function Dashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);

  useEffect(() => {
    const allVideos = getVideos();
    const activeVideos = allVideos.filter((v) => !v.archived);
    setVideos(activeVideos);
    setRecentVideos(activeVideos.slice(0, 6));
  }, []);

  const totalDuration = videos.reduce((acc, video) => {
    const [mins, secs] = video.duration.split(":").map(Number);
    return acc + (mins || 0) * 60 + (secs || 0);
  }, 0);

  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Your distraction-free learning workspace
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <VideoIcon className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Videos</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {videos.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Clock className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Duration</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <VideoIcon className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">This Week</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {
                    videos.filter((v) => {
                      const added = new Date(v.dateAdded);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return added > weekAgo;
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Recently Added
          </h2>
          {recentVideos.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {recentVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
              <VideoIcon className="size-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-600 dark:text-zinc-400 mb-1">No videos yet</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Click "Add Video" to start building your library
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}