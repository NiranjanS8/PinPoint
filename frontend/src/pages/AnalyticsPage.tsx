import { BarChart3, CalendarDays, Clock3, Target } from "lucide-react";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { RecentWatchItem } from "../components/ui/RecentWatchItem";
import { SectionCard } from "../components/ui/SectionCard";
import { StatCard } from "../components/ui/StatCard";
import { TagPill } from "../components/ui/TagPill";
import { useContent } from "../context/ContentContext";

export function AnalyticsPage() {
  const { analyticsStats, progressBreakdown, topTopics, videos, loading, error } = useContent();

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Track your learning progress and insights" />
        <p className="mt-[34px] text-[16px] text-textMuted">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Track your learning progress and insights" />
        <p className="mt-[34px] text-[16px] text-[#b42318]">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Track your learning progress and insights" />
        <div className="mt-[34px]">
          <EmptyStateCard
            icon={<BarChart3 className="size-[54px]" strokeWidth={1.7} />}
            title="No analytics yet"
            description="Your progress insights will appear after you save a few videos or playlists."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Track your learning progress and insights" />

      <div className="mt-[34px] grid grid-cols-4 gap-5">
        <StatCard
          icon={<BarChart3 className="size-[18px]" />}
          toneClass="bg-[#eaf2ff] text-[#2563eb]"
          label="Completion Rate"
          value={analyticsStats.completionRate}
          helper={analyticsStats.completedText}
          progress={0}
        />
        <StatCard
          icon={<Clock3 className="size-[18px]" />}
          toneClass="bg-[#e9f9ef] text-[#16a34a]"
          label="Watch Time"
          value={analyticsStats.watchTime}
          helper={analyticsStats.watchTimeRemaining}
        />
        <StatCard
          icon={<Target className="size-[18px]" />}
          toneClass="bg-[#f4edff] text-[#9333ea]"
          label="Learning Streak"
          value={analyticsStats.streak}
          helper={analyticsStats.streakText}
        />
        <StatCard
          icon={<CalendarDays className="size-[18px]" />}
          toneClass="bg-[#fff0e7] text-[#f97316]"
          label="This Week"
          value={analyticsStats.thisWeek}
          helper={analyticsStats.thisWeekText}
        />
      </div>

      <div className="mt-[42px] grid grid-cols-[1.08fr_1fr] gap-7">
        <SectionCard title="Progress Breakdown">
          <div className="grid gap-6">
            {progressBreakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-2.5 flex items-center justify-between gap-3 text-[16px] text-textMuted">
                  <span>{item.label}</span>
                  <strong className="font-semibold text-textStrong">{item.count}</strong>
                </div>
                <ProgressBar value={item.value} tone={item.tone} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top Topics">
          <div className="grid gap-4">
            {topTopics.map((topic, index) => (
              <div key={topic.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[15px] text-textMuted">
                    {index + 1}
                  </span>
                  <TagPill staticStyle className="min-h-[34px] rounded-[12px] bg-[var(--color-surface-muted)] px-3.5 font-semibold">
                    {topic.name}
                  </TagPill>
                </div>
                <span className="text-[15px] text-textMuted">{topic.count}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-7">
        <SectionCard title="Recently Watched">
          <div className="grid gap-4">
            {videos.map((video) => (
              <RecentWatchItem key={video.id} video={video} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
