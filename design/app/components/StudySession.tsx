import { useState, useEffect } from "react";
import { getVideos, type Video } from "../lib/videos";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Play, Pause, SkipForward, Timer, Plus } from "lucide-react";
import { Progress } from "./ui/progress";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";

export function StudySession() {
  const navigate = useNavigate();
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25); // minutes
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // seconds
  const [isPaused, setIsPaused] = useState(false);
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [allVideos, setAllVideos] = useState<Video[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setSessionActive(false);
            setIsPaused(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, isPaused, timeRemaining]);

  const startSession = () => {
    if (queue.length === 0) {
      setSelectDialogOpen(true);
      return;
    }
    setTimeRemaining(sessionDuration * 60);
    setSessionActive(true);
    setIsPaused(false);
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  const stopSession = () => {
    setSessionActive(false);
    setIsPaused(false);
    setTimeRemaining(sessionDuration * 60);
  };

  const nextVideo = () => {
    if (currentVideoIndex < queue.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    }
  };

  const watchCurrentVideo = () => {
    if (queue[currentVideoIndex]) {
      navigate(`/watch/${queue[currentVideoIndex].id}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((sessionDuration * 60 - timeRemaining) / (sessionDuration * 60)) * 100;
  const currentVideo = queue[currentVideoIndex];

  const loadVideos = () => {
    const videos = getVideos().filter(v => !v.archived);
    setAllVideos(videos);
  };

  const handleAddToQueue = (videoIds: string[]) => {
    const videos = getVideos();
    const selected = videos.filter(v => videoIds.includes(v.id));
    setQueue(prev => [...prev, ...selected]);
    setSelectDialogOpen(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Study Session
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Focus mode with timer and video queue
          </p>
        </div>

        {/* Timer Card */}
        <Card className="p-8 mb-6 border border-zinc-200 dark:border-zinc-800 text-center">
          <div className="mb-6">
            <Timer className="size-16 text-blue-500 mx-auto mb-4" />
            <div className="text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              {sessionActive ? (isPaused ? 'Paused' : 'Session in progress') : 'Ready to focus'}
            </p>
          </div>

          {sessionActive && (
            <Progress value={progress} className="h-2 mb-6" />
          )}

          <div className="flex gap-3 justify-center">
            {!sessionActive ? (
              <>
                <div className="flex gap-2 mb-4">
                  {[15, 25, 45, 60].map(duration => (
                    <Button
                      key={duration}
                      variant={sessionDuration === duration ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSessionDuration(duration);
                        setTimeRemaining(duration * 60);
                      }}
                    >
                      {duration}m
                    </Button>
                  ))}
                </div>
                <Button onClick={startSession} size="lg" className="gap-2">
                  <Play className="size-5 fill-current" />
                  Start Session
                </Button>
              </>
            ) : (
              <>
                <Button onClick={pauseSession} variant="outline" size="lg" className="gap-2">
                  {isPaused ? (
                    <>
                      <Play className="size-5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="size-5" />
                      Pause
                    </>
                  )}
                </Button>
                <Button onClick={stopSession} variant="outline" size="lg">
                  Stop
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Current Video */}
        {currentVideo && (
          <Card className="p-6 mb-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Up Next
            </h2>
            <div className="flex items-center gap-4">
              <img
                src={currentVideo.thumbnail}
                alt={currentVideo.title}
                className="w-48 h-28 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  {currentVideo.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                  {currentVideo.channel} • {currentVideo.duration}
                </p>
                <div className="flex gap-2">
                  <Button onClick={watchCurrentVideo} className="gap-2">
                    <Play className="size-4" />
                    Watch Now
                  </Button>
                  {currentVideoIndex < queue.length - 1 && (
                    <Button onClick={nextVideo} variant="outline" className="gap-2">
                      <SkipForward className="size-4" />
                      Skip
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Queue */}
        <Card className="p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Queue ({queue.length})
            </h2>
            <Button
              onClick={() => {
                loadVideos();
                setSelectDialogOpen(true);
              }}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="size-4" />
              Add Videos
            </Button>
          </div>

          {queue.length > 0 ? (
            <div className="space-y-2">
              {queue.map((video, index) => (
                <div
                  key={video.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    index === currentVideoIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-zinc-50 dark:bg-zinc-900'
                  }`}
                >
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 w-6">
                    {index + 1}
                  </span>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {video.channel} • {video.duration}
                    </p>
                  </div>
                  {index === currentVideoIndex && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      <Play className="size-4 fill-current" />
                      Now
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Your queue is empty
              </p>
              <Button
                onClick={() => {
                  loadVideos();
                  setSelectDialogOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="size-4" />
                Add Videos
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Select Videos Dialog */}
      <Dialog open={selectDialogOpen} onOpenChange={setSelectDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Videos to Queue</DialogTitle>
            <DialogDescription>
              Select videos for your study session
            </DialogDescription>
          </DialogHeader>
          <SelectVideosForm
            videos={allVideos}
            onAdd={handleAddToQueue}
            onCancel={() => setSelectDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SelectVideosForm({
  videos,
  onAdd,
  onCancel,
}: {
  videos: Video[];
  onAdd: (videoIds: string[]) => void;
  onCancel: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleVideo = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {videos.map(video => (
          <div
            key={video.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
            onClick={() => toggleVideo(video.id)}
          >
            <Checkbox
              checked={selectedIds.includes(video.id)}
              onCheckedChange={() => toggleVideo(video.id)}
            />
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-24 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                {video.title}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {video.channel} • {video.duration}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onAdd(selectedIds)}
          disabled={selectedIds.length === 0}
        >
          Add {selectedIds.length > 0 && `(${selectedIds.length})`}
        </Button>
      </div>
    </div>
  );
}
