import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getVideos, updateVideo, deleteVideo, type Video, type VideoNote } from "../lib/videos";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Archive,
  ArchiveRestore,
  Trash2,
  Tag,
  Calendar,
  User,
  Plus,
  X,
  FileText,
  Clock,
} from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function VideoPlayer() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteTimestamp, setNoteTimestamp] = useState(0);
  const [watchProgress, setWatchProgress] = useState(0);

  useEffect(() => {
    if (videoId) {
      const videos = getVideos();
      const found = videos.find((v) => v.id === videoId);
      if (found) {
        setVideo(found);
        setWatchProgress(found.watchProgress);
        updateVideo(found.id, { lastWatched: new Date().toISOString() });
      } else {
        navigate("/");
      }
    }
  }, [videoId, navigate]);

  const handleToggleArchive = () => {
    if (!video) return;
    updateVideo(video.id, { archived: !video.archived });
    setVideo({ ...video, archived: !video.archived });
    toast.success(video.archived ? "Video restored" : "Video archived");
  };

  const handleDelete = () => {
    if (!video) return;
    deleteVideo(video.id);
    toast.success("Video deleted");
    navigate("/");
  };

  const handleAddTag = () => {
    if (!video || !newTag.trim()) return;
    const trimmedTag = newTag.trim().toLowerCase();
    if (video.tags.includes(trimmedTag)) {
      toast.error("Tag already exists");
      return;
    }
    const updatedTags = [...video.tags, trimmedTag];
    updateVideo(video.id, { tags: updatedTags });
    setVideo({ ...video, tags: updatedTags });
    setNewTag("");
    setIsAddingTag(false);
    toast.success("Tag added");
  };

  const handleRemoveTag = (tag: string) => {
    if (!video) return;
    const updatedTags = video.tags.filter((t) => t !== tag);
    updateVideo(video.id, { tags: updatedTags });
    setVideo({ ...video, tags: updatedTags });
    toast.success("Tag removed");
  };

  const handleAddNote = () => {
    if (!video || !newNoteContent.trim()) return;
    const newNote: VideoNote = {
      id: Date.now().toString(),
      timestamp: noteTimestamp,
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...video.notes, newNote];
    updateVideo(video.id, { notes: updatedNotes });
    setVideo({ ...video, notes: updatedNotes });
    setNewNoteContent("");
    setIsAddingNote(false);
    toast.success("Note added");
  };

  const handleDeleteNote = (noteId: string) => {
    if (!video) return;
    const updatedNotes = video.notes.filter((n) => n.id !== noteId);
    updateVideo(video.id, { notes: updatedNotes });
    setVideo({ ...video, notes: updatedNotes });
    toast.success("Note deleted");
  };

  const handleProgressChange = (value: number[]) => {
    if (!video) return;
    const newProgress = value[0];
    setWatchProgress(newProgress);
    updateVideo(video.id, { watchProgress: newProgress });
    setVideo({ ...video, watchProgress: newProgress });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!video) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleArchive}
              className="gap-2"
            >
              {video.archived ? (
                <>
                  <ArchiveRestore className="size-4" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="size-4" />
                  Archive
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                {video.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  {video.channel}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  {new Date(video.dateAdded).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Watch Progress
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {watchProgress}%
                  </span>
                </div>
                <Slider
                  value={[watchProgress]}
                  onValueChange={handleProgressChange}
                  max={100}
                  step={5}
                  className="mb-2"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Track your progress through this video
                </p>
              </div>

              {video.description && (
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Tabs defaultValue="tags" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="tags" className="mt-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        <Tag className="size-4" />
                        Tags
                      </div>
                      {!isAddingTag && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddingTag(true)}
                          className="h-7 px-2"
                        >
                          <Plus className="size-3" />
                        </Button>
                      )}
                    </div>

                    {isAddingTag && (
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="New tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddTag();
                            if (e.key === "Escape") {
                              setIsAddingTag(false);
                              setNewTag("");
                            }
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={handleAddTag}
                          className="h-8 px-3"
                        >
                          Add
                        </Button>
                      </div>
                    )}

                    {video.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 pr-1 group hover:border-zinc-300 dark:hover:border-zinc-600"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">No tags yet</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        <FileText className="size-4" />
                        Notes ({video.notes.length})
                      </div>
                      {!isAddingNote && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddingNote(true)}
                          className="h-7 px-2"
                        >
                          <Plus className="size-3" />
                        </Button>
                      )}
                    </div>

                    {isAddingNote && (
                      <div className="mb-4 p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="size-4 text-zinc-500" />
                          <Input
                            type="number"
                            placeholder="Timestamp (seconds)"
                            value={noteTimestamp}
                            onChange={(e) => setNoteTimestamp(Number(e.target.value))}
                            className="h-8 text-sm"
                            min={0}
                          />
                        </div>
                        <Textarea
                          placeholder="Your note..."
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          className="text-sm mb-2"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleAddNote}
                            className="flex-1"
                          >
                            Save Note
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingNote(false);
                              setNewNoteContent("");
                              setNoteTimestamp(0);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {video.notes.length > 0 ? (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {video.notes
                          .sort((a, b) => a.timestamp - b.timestamp)
                          .map((note) => (
                            <div
                              key={note.id}
                              className="p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                  {formatTime(note.timestamp)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="size-3 text-red-600" />
                                </Button>
                              </div>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                {note.content}
                              </p>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 block">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        No notes yet. Add notes with timestamps to remember key moments.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Video Info */}
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  Video Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Duration</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{video.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Status</span>
                    <Badge
                      variant={video.archived ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {video.archived ? "Archived" : "Active"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Notes</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{video.notes.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{video.title}" from your library.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
