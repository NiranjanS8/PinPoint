import { useState, useEffect } from "react";
import { getPlaylists, createPlaylist, deletePlaylist, type Playlist } from "../lib/playlists";
import { getVideos } from "../lib/videos";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
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

const COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-teal-500",
];

export function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    setPlaylists(getPlaylists());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    createPlaylist({
      name: name.trim(),
      description: description.trim(),
      videoIds: [],
      color: selectedColor,
    });

    toast.success("Playlist created");
    setCreateDialogOpen(false);
    resetForm();
    loadPlaylists();
  };

  const handleDelete = () => {
    if (playlistToDelete) {
      deletePlaylist(playlistToDelete);
      toast.success("Playlist deleted");
      setDeleteDialogOpen(false);
      setPlaylistToDelete(null);
      loadPlaylists();
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedColor(COLORS[0]);
  };

  const getPlaylistVideoCount = (playlist: Playlist) => {
    const videos = getVideos();
    return playlist.videoIds.filter(id => videos.some(v => v.id === id)).length;
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Playlists
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Organize your learning content into custom collections
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="size-4" />
            New Playlist
          </Button>
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className="group overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-md"
              >
                <Link to={`/playlists/${playlist.id}`}>
                  <div className={`${playlist.color} h-24 flex items-center justify-center`}>
                    <FolderOpen className="size-12 text-white" />
                  </div>
                </Link>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link to={`/playlists/${playlist.id}`} className="flex-1">
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:underline">
                        {playlist.name}
                      </h3>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaylistToDelete(playlist.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>

                  {playlist.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                      {playlist.description}
                    </p>
                  )}

                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {getPlaylistVideoCount(playlist)} videos
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <FolderOpen className="size-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400 mb-1">No playlists yet</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">
              Create a playlist to organize your learning content
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="size-4" />
              Create Playlist
            </Button>
          </div>
        )}
      </div>

      {/* Create Playlist Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create Playlist</DialogTitle>
              <DialogDescription>
                Organize videos into a custom learning collection
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Web Development Fundamentals"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this playlist about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`${color} size-10 rounded-full ${
                        selectedColor === color
                          ? "ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Playlist</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this playlist. Videos will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlaylistToDelete(null)}>
              Cancel
            </AlertDialogCancel>
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
