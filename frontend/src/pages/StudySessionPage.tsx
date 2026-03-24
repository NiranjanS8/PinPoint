import { Clock3, PauseCircle, Play, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { SectionCard } from "../components/ui/SectionCard";
import { TimerSelector } from "../components/ui/TimerSelector";
import { useContent } from "../context/ContentContext";
import { useToast } from "../context/ToastContext";

export function StudySessionPage() {
  const { videos, studyQueue, addQueueItem, removeQueueItem } = useContent();
  const { showToast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(selectedDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showQueueDialog, setShowQueueDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [sessionMessage, setSessionMessage] = useState("Ready to focus");

  useEffect(() => {
    if (isRunning) {
      return;
    }

    if (sessionMessage === "Session paused") {
      return;
    }

    setRemainingSeconds(selectedDuration * 60);
  }, [selectedDuration, isRunning, sessionMessage]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          setSessionMessage("Session complete");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  const queuedContentIds = useMemo(() => new Set(studyQueue.map((item) => item.content.id)), [studyQueue]);
  const isPaused = !isRunning && sessionMessage === "Session paused";

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function openQueueDialog() {
    setPendingSelection(studyQueue.map((item) => item.content.id));
    setShowQueueDialog(true);
  }

  function closeQueueDialog() {
    setPendingSelection(studyQueue.map((item) => item.content.id));
    setShowQueueDialog(false);
  }

  function togglePendingVideo(id: string) {
    setPendingSelection((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function saveQueue() {
    const selectedSet = new Set(pendingSelection);
    const toAdd = pendingSelection.filter((id) => !queuedContentIds.has(id));
    const toRemove = studyQueue.filter((item) => !selectedSet.has(item.content.id));

    await Promise.all([
      ...toAdd.map((id) => addQueueItem(Number(id))),
      ...toRemove.map((item) => removeQueueItem(Number(item.id)))
    ]);

    showToast({
      tone: "success",
      title: "Queue updated",
      description: `${pendingSelection.length} item${pendingSelection.length === 1 ? "" : "s"} ready for study.`
    });
    setShowQueueDialog(false);
  }

  async function handleRemoveFromQueue(queueItemId: string) {
    await removeQueueItem(Number(queueItemId));
    showToast({
      tone: "info",
      title: "Removed from queue",
      description: "The item was removed from this study session."
    });
  }

  function handleStartSession() {
    if (remainingSeconds === 0 || sessionMessage === "Session complete") {
      setRemainingSeconds(selectedDuration * 60);
    }

    setIsRunning(true);
    setSessionMessage("Focus mode in progress");
    showToast({
      tone: "info",
      title: "Focus mode started",
      description: `Timer set for ${selectedDuration} minutes.`
    });
  }

  function handlePauseSession() {
    setIsRunning(false);
    setSessionMessage("Session paused");
    showToast({
      tone: "info",
      title: "Session paused",
      description: "Your timer is paused."
    });
  }

  function handleResetSession() {
    setIsRunning(false);
    setRemainingSeconds(selectedDuration * 60);
    setSessionMessage("Ready to focus");
    showToast({
      tone: "info",
      title: "Session reset",
      description: `Timer reset to ${selectedDuration} minutes.`
    });
  }

  return (
    <div>
      <PageHeader title="Study Session" subtitle="Focus mode with timer and video queue" />

      <SectionCard className="mt-7 min-h-[360px]">
        <div className="grid justify-items-center text-center">
          <Clock3 className="size-[42px] text-accentBlue" />
          <div className="mt-[18px] text-[82px] font-bold leading-none tracking-[-0.05em] text-textStrong">
            {formatTime(remainingSeconds)}
          </div>
          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[15px] ${
              isPaused
                ? "bg-[rgba(245,158,11,0.12)] text-[#fbbf24]"
                : "bg-[var(--color-surface-soft)] text-textMuted"
            }`}
          >
            {isPaused ? <PauseCircle className="size-4" /> : null}
            <span>{sessionMessage}</span>
          </div>

          <div className="mt-7 grid justify-items-center gap-4">
            <TimerSelector value={selectedDuration} onChange={setSelectedDuration} />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton
                className="min-h-[48px] min-w-[168px] rounded-2xl bg-accentBlue px-6 text-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:brightness-105"
                onClick={handleStartSession}
                disabled={isRunning}
              >
                <Play className="size-4 fill-current" />
                Start Session
              </PrimaryButton>
              <SecondaryButton
                className="min-h-[48px] min-w-[136px] rounded-2xl px-5"
                onClick={handlePauseSession}
                disabled={!isRunning}
              >
                <PauseCircle className="size-4" />
                Pause
              </SecondaryButton>
              <SecondaryButton className="min-h-[48px] min-w-[136px] rounded-2xl px-5" onClick={handleResetSession}>
                Reset
              </SecondaryButton>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="mt-6">
        <SectionCard
          title={`Queue (${studyQueue.length})`}
          actions={
            studyQueue.length > 0 ? (
              <SecondaryButton className="min-w-[148px]" onClick={openQueueDialog}>
                <Plus className="size-4" />
                Add Videos
              </SecondaryButton>
            ) : undefined
          }
          className="min-h-[240px]"
        >
          {studyQueue.length === 0 ? (
            <div className="grid min-h-[170px] place-items-center content-center gap-4 text-center">
              <div className="grid gap-2">
                <p className="m-0 text-[18px] font-semibold text-textStrong">Your queue is empty</p>
                <p className="m-0 text-[15px] leading-6 text-textMuted">
                  Add a few lessons to build a focused session and move through them without breaking context.
                </p>
              </div>
              <PrimaryButton
                onClick={openQueueDialog}
                className="min-h-[48px] min-w-[188px] rounded-2xl bg-accentBlue px-5 text-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:brightness-105"
              >
                <Plus className="size-4" />
                Add Videos
              </PrimaryButton>
            </div>
          ) : (
            <div className="grid gap-4">
              {studyQueue.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl bg-[var(--color-surface-soft)] p-3.5"
                >
                  <img
                    src={item.content.thumbnail}
                    alt={item.content.title}
                    className="h-16 w-[88px] rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-[17px] font-semibold text-textStrong">{item.content.title}</h3>
                    <p className="mt-1 text-[14px] text-textMuted">
                      {item.content.channel} {"\u2022"} {item.content.duration}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRemoveFromQueue(item.id)}
                    className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-textMuted transition hover:bg-mutedPanel"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {showQueueDialog ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(16,24,40,0.22)] p-6">
          <div className="w-full max-w-[560px] rounded-[20px] bg-panel p-6 shadow-dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-[22px] font-semibold text-textStrong">Add Videos to Queue</h2>
                <p className="mt-1.5 text-[15px] text-textMuted">
                  Choose saved videos or playlists for this session.
                </p>
              </div>
              <button
                type="button"
                onClick={closeQueueDialog}
                className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-textMuted transition hover:bg-mutedPanel"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 max-h-[340px] overflow-y-auto">
              {videos.length === 0 ? (
                <p className="text-[15px] text-textMuted">Save a few videos first, then add them to your study queue.</p>
              ) : (
                <div className="grid gap-3">
                  {videos.map((video) => {
                    const selected = pendingSelection.includes(video.id);

                    return (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => togglePendingVideo(video.id)}
                        className={`grid grid-cols-[20px_72px_minmax(0,1fr)] items-center gap-4 rounded-2xl border px-3.5 py-3 text-left transition ${
                          selected
                            ? "border-borderSoft bg-[var(--color-surface-muted)]"
                            : "border-borderSoft bg-panel hover:bg-mutedPanel"
                        }`}
                      >
                        <span
                          className={`inline-flex size-5 items-center justify-center rounded-full border ${
                            selected ? "border-navy bg-navy" : "border-borderSoft bg-panel"
                          }`}
                        >
                          {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                        </span>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-12 w-[72px] rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <h3 className="truncate text-[15px] font-semibold text-textStrong">{video.title}</h3>
                          <p className="mt-1 text-[13px] text-textMuted">
                            {video.channel} {"\u2022"} {video.duration}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <SecondaryButton onClick={closeQueueDialog}>Cancel</SecondaryButton>
              <PrimaryButton onClick={() => void saveQueue()}>
                <Plus className="size-4" />
                Add to Queue
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
