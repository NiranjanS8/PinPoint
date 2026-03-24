import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { addVideo, extractYouTubeId } from "../lib/videos";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface AddVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVideoDialog({ open, onOpenChange }: AddVideoDialogProps) {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    try {
      const video = addVideo({
        title: title || "Untitled Video",
        description: description || "",
        url: url,
        youtubeId: youtubeId,
        thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        archived: false,
        duration: duration || "0:00",
        channel: channel || "Unknown Channel",
        notes: [],
        watchProgress: 0,
        durationSeconds: parseDurationToSeconds(duration || "0:00"),
      });

      toast.success("Video added successfully");
      onOpenChange(false);
      resetForm();
      
      // Navigate to the video player
      navigate(`/watch/${video.id}`);
    } catch (error) {
      toast.error("Failed to add video");
    }
  };

  const resetForm = () => {
    setUrl("");
    setTitle("");
    setDescription("");
    setChannel("");
    setDuration("");
    setTags("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add YouTube Video</DialogTitle>
            <DialogDescription>
              Add a new video to your learning library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">YouTube URL *</Label>
              <Input
                id="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Input
                id="channel"
                placeholder="Channel name"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="15:30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this video about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="react, javascript, tutorial"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-zinc-500">
                Separate tags with commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Video</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function parseDurationToSeconds(duration: string): number {
  const [minutes, seconds] = duration.split(":").map(Number);
  return (minutes || 0) * 60 + (seconds || 0);
}