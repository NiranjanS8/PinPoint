import type { VideoItem } from "../../types/workspace";

export function RecentWatchItem({ video }: { video: VideoItem }) {
  return (
    <div className="grid grid-cols-[160px_minmax(0,1fr)_auto] items-center gap-5 rounded-2xl bg-[var(--color-surface-soft)] p-4">
      <img src={video.thumbnail} alt={video.title} className="h-[90px] w-[160px] rounded-lg object-cover" />
      <div className="min-w-0">
        <h3 className="m-0 line-clamp-2 text-[18px] leading-[1.35] text-textStrong">{video.title}</h3>
        <p className="mt-2.5 text-[15px] text-textMuted">
          {video.channel} {"\u2022"} {video.duration}
        </p>
      </div>
      <div className="grid justify-items-end gap-3">
        <span className="inline-flex min-h-[30px] items-center rounded-full bg-[var(--color-surface-muted)] px-3 text-sm font-semibold text-textStrong">
          {video.progress}%
        </span>
        <span className="text-[15px] text-textMuted">{formatRecentDate(video.lastOpenedAt ?? video.createdAt)}</span>
      </div>
    </div>
  );
}

function formatRecentDate(value: string) {
  return new Date(value).toLocaleDateString("en-US");
}
