import { Video } from "../lib/videos";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { useNavigate } from "react-router";
import { Clock, User, Play } from "lucide-react";
import { Progress } from "./ui/progress";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-md"
      onClick={() => navigate(`/watch/${video.id}`)}
    >
      <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 rounded-full p-3">
            <Play className="size-6 text-zinc-900 dark:text-zinc-100 fill-current" />
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
        
        {/* Progress indicator */}
        {video.watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${video.watchProgress}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-2">
          {video.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-3">
          <User className="size-3" />
          <span className="truncate">{video.channel}</span>
          <span>•</span>
          <Clock className="size-3" />
          <span>{new Date(video.dateAdded).toLocaleDateString()}</span>
        </div>

        {/* Progress bar */}
        {video.watchProgress > 0 && video.watchProgress < 100 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>In Progress</span>
              <span>{video.watchProgress}%</span>
            </div>
            <Progress value={video.watchProgress} className="h-1.5" />
          </div>
        )}

        {video.watchProgress === 100 && (
          <div className="mb-3">
            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
              Completed
            </Badge>
          </div>
        )}

        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {video.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                {tag}
              </Badge>
            ))}
            {video.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                +{video.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}