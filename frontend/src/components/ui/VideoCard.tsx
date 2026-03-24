import { Link } from "react-router-dom";
import { useWorkspaceUi } from "../../context/WorkspaceUiContext";
import { getBestMatchRanges } from "../../utils/search";
import type { VideoItem } from "../../types/workspace";
import { SecondaryButton } from "./SecondaryButton";
import { TagPill } from "./TagPill";

export function VideoCard({
  video,
  onAddToQueue,
  variant = "default",
  highlightQuery = ""
}: {
  video: VideoItem;
  onAddToQueue?: (video: VideoItem) => void;
  variant?: "default" | "library";
  highlightQuery?: string;
}) {
  const { activeContentId, setActiveContentId } = useWorkspaceUi();
  const isActive = Number(video.id) === activeContentId;

  if (variant === "library") {
    return (
      <article
        className={`overflow-hidden rounded-shell bg-panel shadow-panel transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${
          isActive ? "ring-1 ring-white/10" : ""
        }`}
        onMouseEnter={() => setActiveContentId(Number(video.id))}
      >
        <Link to={`/content/${video.id}`} className="block focus:outline-none" onFocus={() => setActiveContentId(Number(video.id))}>
          <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-soft)]">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="h-full w-full object-cover transition duration-200"
            />
          </div>
          <div className="px-[18px] py-4">
            <h3 className="m-0 line-clamp-2 text-[17px] leading-[1.45] text-textStrong">
              <HighlightedTitle text={video.title} query={highlightQuery} />
            </h3>
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
      {onAddToQueue ? (
        <div className="px-[22px] pb-[18px]">
          <SecondaryButton className="w-full justify-center" onClick={() => onAddToQueue(video)}>
            Add to Queue
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
