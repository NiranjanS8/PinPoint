import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getPlaylists, updatePlaylist, addVideoToPlaylist, removeVideoFromPlaylist } from "../lib/playlists";
import { getVideos, type Video } from "../lib/videos";
import { VideoCard } from "./VideoCard";
import { Button } from "./ui/button";
import { ArrowLeft, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";

export function PlaylistView() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [playlistVideos, setPlaylistVideos] = useState<Video[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (playlistId) {
      const playlists = getPlaylists();
      const found = playlists.find(p => p.id === playlistId);
      if (found) {
        setPlaylist(found);
        loadVideos(found);
      } else {
        navigate("/playlists");
      }
    }
  }, [playlistId, navigate]);

  const loadVideos = (p: any) => {
    const videos = getVideos();
    const filtered = videos.filter(v => p.videoIds.includes(v.id));
    setPlaylistVideos(filtered);
  };

  const loadAllVideos = () => {
    const videos = getVideos().filter(v => !v.archived);
    setAllVideos(videos);
  };

  const handleAddVideos = (videoIds: string[]) => {
    if (!playlist) return;
    videoIds.forEach(id => addVideoToPlaylist(playlist.id, id));
    const playlists = getPlaylists();
    const updated = playlists.find(p => p.id === playlist.id);
    if (updated) {
      setPlaylist(updated);
      loadVideos(updated);
    }
    setAddDialogOpen(false);
    toast.success(`${videoIds.length} video(s) added`);
  };

  const handleRemoveVideo = (videoId: string) => {
    if (!playlist) return;
    removeVideoFromPlaylist(playlist.id, videoId);
    const playlists = getPlaylists();
    const updated = playlists.find(p => p.id === playlist.id);
    if (updated) {
      setPlaylist(updated);
      loadVideos(updated);
    }
    toast.success("Video removed from playlist");
  };

  if (!playlist) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const filteredAllVideos = allVideos.filter(v =>
    !playlist.videoIds.includes(v.id) &&
    (v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     v.channel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/playlists">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="size-4" />
            Back to Playlists
          </Button>
        </Link>

        <div className={`${playlist.color} rounded-lg p-8 mb-6`}>
          <h1 className="text-3xl font-semibold text-white mb-2">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-white/90 mb-4">{playlist.description}</p>
          )}
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span>{playlistVideos.length} videos</span>
            <span>
              Created {new Date(playlist.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Videos
          </h2>
          <Button
            onClick={() => {
              loadAllVideos();
              setAddDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="size-4" />
            Add Videos
          </Button>
        </div>

        {playlistVideos.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {playlistVideos.map((video) => (
              <div key={video.id} className="relative group">
                <VideoCard video={video} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveVideo(video.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-zinc-900/90 hover:bg-red-50 dark:hover:bg-red-900"
                >
                  <X className="size-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-1">
              No videos in this playlist
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">
              Add videos to start building your learning path
            </p>
            <Button
              onClick={() => {
                loadAllVideos();
                setAddDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="size-4" />
              Add Videos
            </Button>
          </div>
        )}
      </div>

      {/* Add Videos Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Videos to Playlist</DialogTitle>
            <DialogDescription>
              Select videos to add to "{playlist.name}"
            </DialogDescription>
          </DialogHeader>

          <AddVideosForm
            videos={filteredAllVideos}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAddVideos}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddVideosForm({
  videos,
  searchQuery,
  onSearchChange,
  onAdd,
  onCancel,
}: {
  videos: Video[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
      <Input
        placeholder="Search videos..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {videos.length > 0 ? (
          videos.map(video => (
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
          ))
        ) : (
          <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
            No videos available
          </p>
        )}
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
