import { PlayCircle, Pin } from "lucide-react";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { VideoCard } from "../components/ui/VideoCard";
import { useContent } from "../context/ContentContext";

export function DashboardPage() {
  const { videos, loading, error } = useContent();
  const pinnedVideos = videos.filter((video) => video.pinned).slice(0, 3);
  const continueLearning = videos
    .filter((video) => video.progress > 0 && video.progress < 100)
    .slice(0, 4);
  const recentlyAdded = videos.slice(0, 3);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your distraction-free learning workspace" />

      {loading ? <p className="mt-[34px] text-[16px] text-textMuted">Loading your saved content...</p> : null}
      {!loading && error ? <p className="mt-[34px] text-[16px] text-[#b42318]">{error}</p> : null}

      {!loading && !error && videos.length === 0 ? (
        <section className="mt-[34px]">
          <EmptyStateCard
            icon={<span className="text-[42px]">+</span>}
            title="No saved content yet"
            description="Add your first YouTube video or playlist to start building your workspace."
          />
        </section>
      ) : null}

      {!loading && !error && videos.length > 0 ? (
        <div className="mt-[34px] grid gap-8">
          {pinnedVideos.length > 0 ? (
            <section>
              <div className="mb-[22px] flex items-center gap-2.5">
                <Pin className="size-[18px] text-textMuted" />
                <h2 className="m-0 text-[18px] font-semibold text-textStrong">Pinned</h2>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {pinnedVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <div className="mb-[22px] flex items-center gap-2.5">
              <PlayCircle className="size-[18px] text-textMuted" />
              <h2 className="m-0 text-[18px] font-semibold text-textStrong">Continue Learning</h2>
            </div>
            <SectionCard className="p-0">
              <div className="grid gap-4 p-5">
                {continueLearning.slice(0, 4).map((video) => (
                  <div
                    key={video.id}
                  className="grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl bg-[var(--color-surface-soft)] p-3.5"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-16 w-[88px] rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-[17px] font-semibold text-textStrong">{video.title}</h3>
                      <p className="mt-1 text-[14px] text-textMuted">
                        {video.channel} {"\u2022"} {video.progress}% complete
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-sm font-semibold text-textStrong">
                      {video.duration}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </section>

          <section>
            <h2 className="m-0 mb-[22px] text-[18px] font-semibold text-textStrong">Recently Added</h2>
            <div className="grid grid-cols-3 gap-5">
              {recentlyAdded.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
