import { Link } from "react-router-dom";
import type { VideoItem } from "../../types/workspace";
import { SecondaryButton } from "./SecondaryButton";
import { ProgressBar } from "./ProgressBar";
import { TagPill } from "./TagPill";

export function VideoCard({
  video,
  onAddToQueue,
  variant = "default"
}: {
  video: VideoItem;
  onAddToQueue?: (video: VideoItem) => void;
  variant?: "default" | "library";
}) {
  if (variant === "library") {
    return (
      <article className="overflow-hidden rounded-shell bg-panel shadow-panel transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <Link to={`/content/${video.id}`} className="block">
          <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-soft)]">
            <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-[rgba(255,255,255,0.08)]">
              <div className="h-full bg-accentBlue" style={{ width: `${video.progress}%` }} />
            </div>
          </div>
          <div className="px-[22px] py-5">
            <h3 className="m-0 line-clamp-2 text-[18px] leading-[1.4] text-textStrong">{video.title}</h3>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-shell bg-panel shadow-panel transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      <Link to={`/content/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-soft)]">
          <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
          <span className="absolute bottom-2.5 right-3.5 inline-flex min-h-7 items-center rounded-lg bg-[rgba(17,24,39,0.92)] px-2.5 text-[13px] text-white">
            {video.duration}
          </span>
        </div>
        <div className="h-1 bg-[var(--color-progress-track)]">
          <div className="h-full bg-accentBlue" style={{ width: `${video.progress}%` }} />
        </div>
        <div className="px-[22px] pb-[18px] pt-6">
          <h3 className="m-0 text-[18px] leading-[1.35] text-textStrong">{video.title}</h3>
          <p className="mt-3.5 text-[15px] text-textMuted">
            {video.channel} {"\u2022"} {video.date}
          </p>
          <div className="mt-3.5 flex items-center justify-between gap-3 text-[15px] text-textMuted">
            <span>{formatStatus(video.status)}</span>
            <span>{video.progress}%</span>
          </div>
          <div className="mt-2.5">
            <ProgressBar value={video.progress} tone="dark" compact />
          </div>
          {video.notes ? (
            <p className="mt-3 line-clamp-2 text-[14px] leading-6 text-textMuted">
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
          <SecondaryButton
            className="w-full justify-center"
            onClick={() => onAddToQueue(video)}
          >
            Add to Queue
          </SecondaryButton>
        </div>
      ) : null}
    </article>
  );
}

function formatStatus(status: VideoItem["status"]) {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "IN_PROGRESS":
      return "In Progress";
    case "NOT_STARTED":
    default:
      return "Not Started";
  }
}
