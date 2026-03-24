import {
  ArrowRight,
  Pin,
  SquareArrowOutUpRight,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useContent } from "../context/ContentContext";
import { formatNoteTimestamp, parseIndexedNotes } from "../utils/indexedNotes";
import { fetchContentById } from "../services/contentApi";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { YouTubePlayer } from "../components/content/YouTubePlayer";
import type { SavedContentDto } from "../types/api";

export function MiniPlayerPage({
  initialContentId,
  initialAlwaysOnTop
}: {
  initialContentId: number | null;
  initialAlwaysOnTop: boolean;
}) {
  const { studyQueue } = useContent();
  const [contentId, setContentId] = useState<number | null>(initialContentId);
  const [content, setContent] = useState<SavedContentDto | null>(null);
  const [alwaysOnTop, setAlwaysOnTop] = useState(initialAlwaysOnTop);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContentId(initialContentId);
    setAlwaysOnTop(initialAlwaysOnTop);
  }, [initialAlwaysOnTop, initialContentId]);

  useEffect(() => {
    if (!window.pinpointDesktop?.onMiniPlayerContext) {
      return;
    }

    return window.pinpointDesktop.onMiniPlayerContext((payload) => {
      setContentId(payload.contentId);
      setAlwaysOnTop(payload.alwaysOnTop);
    });
  }, []);

  useEffect(() => {
    async function loadContent() {
      if (!contentId) {
        setContent(null);
        setLoading(false);
        setError("Nothing selected for mini player.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchContentById(contentId);
        setContent(response);
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : "Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    void loadContent();
  }, [contentId]);

  const currentQueueIndex = useMemo(() => {
    if (!content) {
      return -1;
    }

    return studyQueue.findIndex((item) => Number(item.content.id) === content.id);
  }, [content, studyQueue]);

  const nextQueueItem = useMemo(() => {
    if (currentQueueIndex < 0) {
      return null;
    }

    return studyQueue[currentQueueIndex + 1] ?? null;
  }, [currentQueueIndex, studyQueue]);

  const playerSource = useMemo(() => {
    if (!content) {
      return null;
    }

    return toPlayerSource(content.url, content.contentType);
  }, [content]);

  const notes = useMemo(() => {
    if (!content?.notes) {
      return [];
    }

    return parseIndexedNotes(content.notes).filter((note) => note.text.trim().length > 0);
  }, [content?.notes]);

  async function handleOpenFullView() {
    if (!content) {
      return;
    }

    await window.pinpointDesktop?.openFullView(content.id);
  }

  async function handleToggleAlwaysOnTop() {
    if (!window.pinpointDesktop?.toggleMiniPlayerAlwaysOnTop) {
      return;
    }

    const next = await window.pinpointDesktop.toggleMiniPlayerAlwaysOnTop();
    setAlwaysOnTop(next);
  }

  async function handleClose() {
    await window.pinpointDesktop?.closeMiniPlayer?.();
  }

  async function handleNext() {
    if (!nextQueueItem) {
      return;
    }

    await window.pinpointDesktop?.openMiniPlayer(Number(nextQueueItem.content.id));
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-shell text-textStrong">
      <div className="flex items-center gap-2 border-b border-borderSoft px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-textStrong">
            {content?.title ?? "Mini Player"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleToggleAlwaysOnTop()}
          className={`inline-flex size-8 items-center justify-center rounded-xl transition ${
            alwaysOnTop
              ? "bg-[var(--color-surface-selected)] text-textStrong"
              : "bg-[var(--color-surface-soft)] text-textMuted hover:bg-[var(--color-surface-hover)]"
          }`}
          title={alwaysOnTop ? "Disable always on top" : "Keep always on top"}
        >
          <Pin className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => void handleOpenFullView()}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-textMuted transition hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
          title="Open full view"
        >
          <SquareArrowOutUpRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => void handleClose()}
          className="inline-flex size-8 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-textMuted transition hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
          title="Close mini player"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="aspect-video w-full overflow-hidden bg-[#07090d]">
          {loading ? (
            <div className="grid h-full place-items-center text-[14px] text-textMuted">Loading content...</div>
          ) : error || !content || !playerSource ? (
            <div className="grid h-full place-items-center px-6 text-center">
              <p className="text-[14px] text-textMuted">{error ?? "This content cannot be played here."}</p>
            </div>
          ) : (
            <YouTubePlayer source={playerSource} autoplay />
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-textMuted">Notes</p>
              <p className="mt-1 text-[13px] text-textMuted">
                {notes.length > 0 ? `${notes.length} saved note${notes.length === 1 ? "" : "s"}` : "No notes for this video yet."}
              </p>
            </div>
            {nextQueueItem ? (
              <SecondaryButton className="min-h-[36px] px-3 text-[13px]" onClick={() => void handleNext()}>
                <ArrowRight className="size-4" />
                Next
              </SecondaryButton>
            ) : null}
          </div>

          <div className="mini-player-notes-scroll min-h-0 flex-1 overflow-y-auto rounded-2xl bg-[var(--color-surface-soft)]/70 p-2">
            {notes.length > 0 ? (
              <div className="grid gap-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-[18px] bg-[var(--color-panel)] px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
                  >
                    <div className="mb-2 inline-flex items-center rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-textMuted">
                      {formatNoteTimestamp(note.timestampSeconds)}
                    </div>
                    <p className="line-clamp-3 text-[13px] leading-6 text-textStrong">{note.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[120px] items-center justify-center rounded-[18px] bg-[var(--color-panel)] px-4 text-center">
                <p className="max-w-[240px] text-[13px] leading-6 text-textMuted">
                  Add notes from the full content view to keep key timestamps visible while the mini player stays open.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toPlayerSource(url: string, contentType: SavedContentDto["contentType"]) {
  try {
    const parsedUrl = new URL(url);

    if (contentType === "PLAYLIST") {
      const playlistId = parsedUrl.searchParams.get("list");
      return playlistId ? { type: "playlist" as const, listId: playlistId } : null;
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? { type: "video" as const, videoId } : null;
    }

    const videoId = parsedUrl.searchParams.get("v");
    return videoId ? { type: "video" as const, videoId } : null;
  } catch {
    return null;
  }
}
