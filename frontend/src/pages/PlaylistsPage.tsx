import { FolderOpen, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { SectionCard } from "../components/ui/SectionCard";

interface PlaylistItem {
  id: string;
  name: string;
  createdAt: string;
}

const PLAYLIST_STORAGE_KEY = "pinpoint-playlists";

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(PLAYLIST_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      setPlaylists(JSON.parse(stored) as PlaylistItem[]);
    } catch {
      setPlaylists([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists]);

  const sortedPlaylists = useMemo(
    () =>
      [...playlists].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      ),
    [playlists]
  );

  function openDialog() {
    setName("");
    setError(null);
    setShowDialog(true);
  }

  function closeDialog() {
    setShowDialog(false);
    setName("");
    setError(null);
  }

  function createPlaylist() {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      setError("Please enter a playlist name.");
      return;
    }

    if (playlists.some((playlist) => playlist.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError("A playlist with that name already exists.");
      return;
    }

    setPlaylists((current) => [
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    closeDialog();
  }

  return (
    <div>
      <div className="mb-7 flex items-start justify-between gap-6">
        <PageHeader
          title="Playlists"
          subtitle="Organize your learning content into custom collections"
        />
        <PrimaryButton onClick={openDialog}>
          <Plus className="size-4" />
          New Playlist
        </PrimaryButton>
      </div>

      {sortedPlaylists.length === 0 ? (
        <EmptyStateCard
          icon={<FolderOpen className="size-[54px]" strokeWidth={1.8} />}
          title="No playlists yet"
          description="Create a playlist to organize your learning content"
          action={
            <PrimaryButton onClick={openDialog}>
              <Plus className="size-4" />
              Create Playlist
            </PrimaryButton>
          }
        />
      ) : (
        <SectionCard title={`Playlists (${sortedPlaylists.length})`}>
          <div className="grid gap-4">
            {sortedPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center justify-between rounded-2xl bg-[var(--color-surface-soft)] px-5 py-4"
              >
                <div className="flex items-center gap-3.5">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#eef2f6] text-textMuted">
                    <FolderOpen className="size-5" />
                  </span>
                  <div>
                    <h3 className="m-0 text-[17px] font-semibold text-textStrong">{playlist.name}</h3>
                    <p className="mt-1 text-[14px] text-textMuted">
                      Created {new Date(playlist.createdAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {showDialog ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(16,24,40,0.22)] p-6">
          <div className="w-full max-w-[430px] rounded-[20px] bg-panel p-6 shadow-dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-[22px] font-semibold text-textStrong">Create Playlist</h2>
                <p className="mt-1.5 text-[15px] text-textMuted">
                  Save a custom collection to organize your learning content.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-textMuted transition hover:bg-mutedPanel"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-textStrong">Playlist Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Frontend Deep Dives"
                  className="min-h-[46px] rounded-[14px] bg-mutedPanel px-4 text-sm text-textStrong outline-none ring-1 ring-inset ring-borderSoft focus:ring-white/10"
                />
              </label>

              {error ? <p className="m-0 text-sm text-[#b42318]">{error}</p> : null}

              <div className="flex justify-end gap-3">
                <SecondaryButton onClick={closeDialog}>Cancel</SecondaryButton>
                <PrimaryButton onClick={createPlaylist}>
                  <Plus className="size-4" />
                  Create Playlist
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
