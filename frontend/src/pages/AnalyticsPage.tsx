import { BarChart3, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Target, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { RecentWatchItem } from "../components/ui/RecentWatchItem";
import { SectionCard } from "../components/ui/SectionCard";
import { StatCard } from "../components/ui/StatCard";
import { useContent } from "../context/ContentContext";
import { useToast } from "../context/ToastContext";

export function AnalyticsPage() {
  const {
    analyticsStats,
    focusAnalytics,
    progressBreakdown,
    videos,
    recentlyWatched,
    studyGoals,
    createStudyGoal,
    updateStudyGoal,
    deleteStudyGoal,
    loading,
    error
  } = useContent();
  const { showToast } = useToast();
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [goalCalendarOpen, setGoalCalendarOpen] = useState(false);
  const [goalCalendarMonth, setGoalCalendarMonth] = useState(() => startOfMonth(new Date()));
  const goalCalendarRef = useRef<HTMLDivElement | null>(null);

  const goalCalendarDays = useMemo(() => buildCalendarDays(goalCalendarMonth), [goalCalendarMonth]);

  useEffect(() => {
    if (!goalCalendarOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!goalCalendarRef.current?.contains(event.target as Node)) {
        setGoalCalendarOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setGoalCalendarOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [goalCalendarOpen]);

  function isValidGoalDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }

  async function handleCreateGoal() {
    if (!goalTitle.trim() || !goalDate) {
      showToast({
        tone: "error",
        title: "Goal details missing",
        description: "Add a goal title and target date."
      });
      return;
    }

    if (!isValidGoalDate(goalDate)) {
      showToast({
        tone: "error",
        title: "Invalid target date",
        description: "Choose a valid target date from the calendar."
      });
      return;
    }

    try {
      await createStudyGoal({
        title: goalTitle.trim(),
        targetDate: goalDate
      });
      setGoalTitle("");
      setGoalDate("");
      showToast({
        tone: "success",
        title: "Goal created",
        description: "Your countdown is now tracked in Analytics."
      });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Unable to create goal",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    }
  }

  function openGoalDatePicker() {
    const baseDate = goalDate ? new Date(`${goalDate}T00:00:00`) : new Date();
    setGoalCalendarMonth(startOfMonth(baseDate));
    setGoalCalendarOpen((current) => !current);
  }

  async function handleToggleGoal(goalId: string, completed: boolean) {
    try {
      await updateStudyGoal(Number(goalId), { completed: !completed });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Goal update failed",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    }
  }

  async function handleDeleteGoal(goalId: string) {
    try {
      await deleteStudyGoal(Number(goalId));
      showToast({
        tone: "info",
        title: "Goal deleted",
        description: "The goal was removed from your tracker."
      });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Goal delete failed",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    }
  }

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
        />
        <StatCard
          icon={<Clock3 className="size-[18px]" />}
          toneClass="bg-[#e9f9ef] text-[#16a34a]"
          label="Focus Hours"
          value={focusAnalytics.totalFocusHours}
        />
        <StatCard
          icon={<Target className="size-[18px]" />}
          toneClass="bg-[#f4edff] text-[#9333ea]"
          label="Current Streak"
          value={focusAnalytics.currentStreak}
          helper=""
        />
        <StatCard
          icon={<CalendarDays className="size-[18px]" />}
          toneClass="bg-[#fff0e7] text-[#f97316]"
          label="Longest Streak"
          value={focusAnalytics.longestStreak}
        />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-7 items-stretch">
        <SectionCard title="Focus Contributions" className="h-full min-h-[360px]">
          {focusAnalytics.contributionDays.length === 0 ? (
            <p className="text-[15px] text-textMuted">Complete a focus session to start your contribution graph.</p>
          ) : (
            <div className="grid gap-4">
              <div className="grid grid-cols-12 gap-2">
                {focusAnalytics.contributionDays.map((day) => (
                  <div
                    key={day.date}
                    className={`aspect-square rounded-[8px] ${
                      day.intensity === 0
                        ? "bg-[var(--color-surface-soft)]"
                        : day.intensity === 1
                          ? "bg-[#18344a]"
                          : day.intensity === 2
                            ? "bg-[#1d5d87]"
                            : day.intensity === 3
                              ? "bg-[#267ac0]"
                              : "bg-[#3b82f6]"
                    }`}
                    title={`${day.date} • ${day.minutes} minutes`}
                  />
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Topic Heatmap" className="h-full min-h-[360px]">
          {focusAnalytics.topicHeatmap.length === 0 ? (
            <p className="text-[15px] text-textMuted">Add tags or organize content into folders to reveal your topic mix.</p>
          ) : (
            <div className="grid gap-4">
              {focusAnalytics.topicHeatmap.map((topic) => (
                <div key={topic.label} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-[14px]">
                    <span className="font-medium text-textStrong">{topic.label}</span>
                    <span className="text-textMuted">
                      {topic.percentage}% • {topic.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-surface-soft)]">
                    <div
                      className="h-full rounded-full bg-[#3b82f6]"
                      style={{ width: `${Math.max(topic.percentage, 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-7 items-stretch">
        <SectionCard title="Goal Tracker" className="h-full min-h-[340px]">
          <div className="grid gap-5">
            <div className="grid gap-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3">
              <input
                type="text"
                value={goalTitle}
                onChange={(event) => setGoalTitle(event.target.value)}
                placeholder="Set a study goal"
                className="min-h-[44px] rounded-[13px] bg-[var(--color-surface-soft)] px-4 text-[15px] text-textStrong outline-none ring-1 ring-transparent focus:ring-white/10"
              />
              <div className="relative" ref={goalCalendarRef}>
                <button
                  type="button"
                  onClick={openGoalDatePicker}
                  className={`inline-flex size-[44px] items-center justify-center rounded-[13px] transition ${
                    goalDate
                      ? "bg-[var(--color-surface-selected)] text-textStrong"
                      : "bg-[var(--color-surface-soft)] text-textMuted hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
                  }`}
                  title={goalDate ? `Target date: ${formatCalendarDate(goalDate)}` : "Choose target date"}
                  aria-label={goalDate ? `Target date: ${formatCalendarDate(goalDate)}` : "Choose target date"}
                >
                  <CalendarDays className="size-5" />
                </button>
              </div>
              <PrimaryButton className="min-h-[44px] px-4" onClick={() => void handleCreateGoal()}>
                Add Goal
              </PrimaryButton>
              </div>

              {goalCalendarOpen ? (
                <div className="w-fit rounded-[16px] bg-[var(--color-surface-soft)] p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.28)] ring-1 ring-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setGoalCalendarMonth((current) => addMonths(current, -1))}
                      className="inline-flex size-7 items-center justify-center rounded-lg bg-[var(--color-panel)] text-textMuted transition hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <div className="text-[13px] font-semibold text-textStrong">
                      {goalCalendarMonth.toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric"
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setGoalCalendarMonth((current) => addMonths(current, 1))}
                      className="inline-flex size-7 items-center justify-center rounded-lg bg-[var(--color-panel)] text-textMuted transition hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
                      aria-label="Next month"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[9px] font-semibold uppercase tracking-[0.08em] text-textMuted">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                      <span key={day} className="py-1">
                        {day}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {goalCalendarDays.map((day) => {
                      const dayValue = formatDateValue(day.date);
                      const isSelected = goalDate === dayValue;
                      const isCurrentMonth = day.inCurrentMonth;
                      return (
                        <button
                          key={dayValue}
                          type="button"
                          onClick={() => {
                            setGoalDate(dayValue);
                            setGoalCalendarOpen(false);
                          }}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[12px] transition ${
                            isSelected
                              ? "bg-[#2d6cdf] font-semibold text-white"
                              : isCurrentMonth
                                ? "text-textStrong hover:bg-[var(--color-panel)]"
                                : "text-textMuted hover:bg-[var(--color-panel)]"
                          }`}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {studyGoals.length === 0 ? (
              <p className="text-[15px] text-textMuted">
                Set a deadline-driven goal and Pinpoint will keep the days remaining in view.
              </p>
            ) : (
              <div className="grid gap-3">
                {studyGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className={`truncate text-[15px] font-semibold ${goal.completed ? "text-textMuted line-through" : "text-textStrong"}`}>
                        {goal.title}
                      </p>
                      <p className="mt-1 text-[13px] text-textMuted">
                        {goal.contentTitle ? `${goal.contentTitle} • ` : ""}
                        {goal.completed ? "Completed" : `${goal.daysRemaining} day${goal.daysRemaining === 1 ? "" : "s"} remaining`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleToggleGoal(goal.id, goal.completed)}
                      className={`inline-flex size-9 items-center justify-center rounded-xl transition ${
                        goal.completed
                          ? "bg-[var(--color-surface-selected)] text-textStrong"
                          : "bg-[var(--color-surface-soft)] text-textMuted hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
                      }`}
                      title={goal.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteGoal(goal.id)}
                      className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-textMuted transition hover:bg-[#6b2428] hover:text-white"
                      title="Delete goal"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Recently Watched" className="h-full min-h-[340px]">
          {recentlyWatched.length > 0 ? (
            <div className="grid gap-4">
              {recentlyWatched.map((video) => (
                <RecentWatchItem key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-textMuted">Open a few lessons and your recent activity will show up here.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCalendarDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function buildCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      date,
      inCurrentMonth: date.getMonth() === month.getMonth()
    };
  });
}
