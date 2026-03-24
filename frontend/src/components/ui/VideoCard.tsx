import { Check, ListPlus, Pin, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspaceUi } from "../../context/WorkspaceUiContext";
import { getBestMatchRanges } from "../../utils/search";
import type { VideoItem } from "../../types/workspace";
import { SecondaryButton } from "./SecondaryButton";
import { TagPill } from "./TagPill";

export function VideoCard({
  video,
  onAddToQueue,
  onRemoveFromQueue,
  onTogglePin,
  onDelete,
  isQueued = false,
  variant = "default",
  highlightQuery = ""
}: {
  video: VideoItem;
  onAddToQueue?: (video: VideoItem) => void;
  onRemoveFromQueue?: (video: VideoItem) => void;
  onTogglePin?: (video: VideoItem) => void;
  onDelete?: (video: VideoItem) => void;
  isQueued?: boolean;
  variant?: "default" | "library";
  highlightQuery?: string;
}) {
  const { activeContentId, setActiveContentId } = useWorkspaceUi();
  const isActive = Number(video.id) === activeContentId;

  if (variant === "library") {
    return (
      <article
        className={`group overflow-hidden rounded-shell bg-panel shadow-panel transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${
          isActive ? "ring-1 ring-white/10" : ""
        }`}
        onMouseEnter={() => setActiveContentId(Number(video.id))}
      >
        <Link
          to={`/content/${video.id}`}
          className="block focus:outline-none"
          onFocus={() => setActiveContentId(Number(video.id))}
        >
          <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-soft)]">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 opacity-0 transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              <div className="flex gap-2">
                {onTogglePin ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onTogglePin(video);
                    }}
                    className={`inline-flex size-8 items-center justify-center rounded-xl backdrop-blur-sm transition ${
                      video.pinned
                        ? "bg-[#2f6feb] text-white"
                        : "bg-[rgba(15,17,21,0.76)] text-white/82 hover:bg-[rgba(15,17,21,0.92)]"
                    }`}
                    aria-label={video.pinned ? "Unpin content" : "Pin content"}
                    title={video.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin className={`size-4 ${video.pinned ? "fill-current" : ""}`} />
                  </button>
                ) : null}
                {onAddToQueue || onRemoveFromQueue ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (isQueued) {
                        onRemoveFromQueue?.(video);
                        return;
                      }

                      onAddToQueue?.(video);
                    }}
                    className={`inline-flex size-8 items-center justify-center rounded-xl backdrop-blur-sm transition ${
                      isQueued
                        ? "bg-[#2f6feb] text-white hover:bg-[#2563eb]"
                        : "bg-[rgba(15,17,21,0.76)] text-white/82 hover:bg-[rgba(15,17,21,0.92)]"
                    }`}
                    aria-label={isQueued ? "Remove from queue" : "Add to queue"}
                    title={isQueued ? "Remove from Queue" : "Add to Queue"}
                  >
                    {isQueued ? <X className="size-4" /> : <ListPlus className="size-4" />}
                  </button>
                ) : null}
              </div>
              {onDelete ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onDelete(video);
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-xl bg-[rgba(15,17,21,0.76)] text-white/82 backdrop-blur-sm transition hover:bg-[#6b2428] hover:text-white"
                  aria-label="Delete content"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              ) : null}
            </div>
            <span className="absolute bottom-3 right-3 inline-flex min-h-6 items-center rounded-lg bg-[rgba(15,17,21,0.86)] px-2 py-1 text-[12px] font-medium text-white">
              {video.duration}
            </span>
            {video.progress > 0 ? (
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
                <div
                  className={`h-full rounded-r-full ${
                    video.status === "COMPLETED" ? "bg-emerald-400" : "bg-[#2f6feb]"
                  }`}
                  style={{ width: `${Math.max(3, Math.min(video.progress, 100))}%` }}
                />
              </div>
            ) : null}
          </div>
          <div className="px-[18px] pb-4 pt-3.5">
            <h3 className="m-0 line-clamp-2 text-[17px] leading-[1.4] text-textStrong">
              <HighlightedTitle text={video.title} query={highlightQuery} />
            </h3>
            <p className="mt-2 text-[13px] text-textMuted">{video.channel}</p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
      className={`overflow-hidden rounded-shell bg-panel shadow-panel transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${
        isActive ? "ring-1 ring-white/10" : ""
      }`}
      onMouseEnter={() => setActiveContentId(Number(video.id))}
    >
      <Link to={`/content/${video.id}`} className="block focus:outline-none" onFocus={() => setActiveContentId(Number(video.id))}>
        <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-soft)]">
          <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
          <span className="absolute bottom-2.5 right-3.5 inline-flex min-h-7 items-center rounded-lg bg-[rgba(17,24,39,0.92)] px-2.5 text-[13px] text-white">
            {video.duration}
          </span>
        </div>
        <div className="px-[22px] pb-[18px] pt-6">
          <h3 className="m-0 text-[18px] leading-[1.35] text-textStrong">
            <HighlightedTitle text={video.title} query={highlightQuery} />
          </h3>
          <p className="mt-3.5 text-[15px] text-textMuted">
            {video.channel} {"\u2022"} {video.date}
          </p>
          {video.notes ? (
            <p className="mt-3.5 line-clamp-2 text-[14px] leading-6 text-textMuted">
              {video.notes}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {video.tags.map((tag) => (
              <TagPill key={tag} staticStyle>
                {tag}
              </TagPill>
            ))}
          </div>
        </div>
      </Link>
      {onAddToQueue || onRemoveFromQueue ? (
        <div className="px-[22px] pb-[18px]">
          <SecondaryButton
            className={`w-full justify-center ${isQueued ? "bg-[var(--color-surface-selected)]" : ""}`}
            onClick={() => {
              if (isQueued) {
                onRemoveFromQueue?.(video);
                return;
              }

              onAddToQueue?.(video);
            }}
          >
            {isQueued ? <Check className="size-4" /> : null}
            {isQueued ? "Remove from Queue" : "Add to Queue"}
          </SecondaryButton>
        </div>
      ) : null}
    </article>
  );
}

function HighlightedTitle({ text, query }: { text: string; query: string }) {
  const ranges = getBestMatchRanges(text, query);
  if (ranges.length === 0) {
    return <>{text}</>;
  }

  const segments = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (cursor < start) {
      segments.push(<span key={`plain-${cursor}`}>{text.slice(cursor, start)}</span>);
    }

    segments.push(
      <mark key={`mark-${start}`} className="rounded-[4px] bg-white/10 px-[1px] text-textStrong">
        {text.slice(start, end)}
      </mark>
    );
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push(<span key={`tail-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return <>{segments}</>;
}
