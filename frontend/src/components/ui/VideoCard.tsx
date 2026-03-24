import { Link } from "react-router-dom";
import type { VideoItem } from "../../types/workspace";
import { ProgressBar } from "./ProgressBar";
import { TagPill } from "./TagPill";

export function VideoCard({ video }: { video: VideoItem }) {
  return (
    <Link
      to={`/content/${video.id}`}
      className="block overflow-hidden rounded-shell border border-borderSoft bg-panel shadow-panel transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
    >
      <article>
        <div className="relative aspect-video overflow-hidden bg-[#e9edf2]">
          <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
          <span className="absolute bottom-2.5 right-3.5 inline-flex min-h-7 items-center rounded-lg bg-[rgba(17,24,39,0.92)] px-2.5 text-[13px] text-white">
            {video.duration}
          </span>
        </div>
        <div className="h-1 bg-[#d7dce4]">
          <div className="h-full bg-accentBlue" style={{ width: `${video.progress}%` }} />
        </div>
        <div className="px-[22px] pb-[18px] pt-6">
          <h3 className="m-0 text-[18px] leading-[1.35] text-textStrong">{video.title}</h3>
          <p className="mt-3.5 text-[15px] text-textMuted">
            {video.channel} {"\u2022"} {video.date}
          </p>
          <div className="mt-3.5 flex items-center justify-between gap-3 text-[15px] text-textMuted">
            <span>In Progress</span>
            <span>{video.progress}%</span>
          </div>
          <div className="mt-2.5">
            <ProgressBar value={video.progress} tone="dark" compact />
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {video.tags.map((tag) => (
              <TagPill key={tag} staticStyle>
                {tag}
              </TagPill>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
