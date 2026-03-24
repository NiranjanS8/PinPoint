import { Clock3, Plus, Play, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { SectionCard } from "../components/ui/SectionCard";
import { TimerSelector } from "../components/ui/TimerSelector";
import { useContent } from "../context/ContentContext";

export function StudySessionPage() {
  const { videos } = useContent();
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(selectedDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [showQueueDialog, setShowQueueDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [sessionMessage, setSessionMessage] = useState("Ready to focus");

  useEffect(() => {
    if (isRunning) {
      return;
    }

    setRemainingSeconds(selectedDuration * 60);
  }, [selectedDuration, isRunning]);

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

  const queueVideos = useMemo(
    () =>
      queueIds
        .map((id) => videos.find((video) => video.id === id))
        .filter((video): video is (typeof videos)[number] => Boolean(video)),
    [queueIds, videos]
  );

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function openQueueDialog() {
    setPendingSelection(queueIds);
    setShowQueueDialog(true);
  }

  function closeQueueDialog() {
    setPendingSelection(queueIds);
    setShowQueueDialog(false);
  }

  function togglePendingVideo(id: string) {
    setPendingSelection((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function saveQueue() {
    setQueueIds(pendingSelection);
    setShowQueueDialog(false);
  }

  function removeFromQueue(id: string) {
    setQueueIds((current) => current.filter((item) => item !== id));
  }

  function handleStartSession() {
    if (remainingSeconds === 0) {
      setRemainingSeconds(selectedDuration * 60);
    }

    setIsRunning((current) => !current);
    setSessionMessage((current) => {
      if (remainingSeconds === 0) {
        return "Focus mode in progress";
      }

      return current === "Ready to focus" || current === "Session complete"
        ? "Focus mode in progress"
        : current === "Focus mode in progress"
          ? "Session paused"
          : "Focus mode in progress";
    });
  }

  return (
    <div>
      <PageHeader title="Study Session" subtitle="Focus mode with timer and video queue" />

      <SectionCard className="mt-[34px] min-h-[418px]">
        <div className="grid justify-items-center text-center">
          <Clock3 className="size-[42px] text-accentBlue" />
          <div className="mt-[22px] text-[82px] font-bold leading-none tracking-[-0.05em] text-textStrong">
            {formatTime(remainingSeconds)}
          </div>
          <p className="mt-3 text-[17px] text-textMuted">{sessionMessage}</p>

          <div className="mt-[34px] flex items-center gap-4">
            <TimerSelector value={selectedDuration} onChange={setSelectedDuration} />
            <PrimaryButton className="min-w-[178px]" onClick={handleStartSession}>
              <Play className="size-4 fill-current" />
              {isRunning ? "Pause Session" : "Start Session"}
            </PrimaryButton>
          </div>
        </div>
      </SectionCard>

      <div className="mt-[30px]">
        <SectionCard
          title={`Queue (${queueVideos.length})`}
          actions={
            <SecondaryButton className="min-w-[148px]" onClick={openQueueDialog}>
              <Plus className="size-4" />
              Add Videos
            </SecondaryButton>
          }
          className="min-h-[286px]"
        >
          {queueVideos.length === 0 ? (
            <div className="grid min-h-[190px] place-items-center content-center gap-4 text-center">
              <p className="m-0 text-[17px] text-textMuted">Your queue is empty</p>
              <PrimaryButton onClick={openQueueDialog}>
                <Plus className="size-4" />
                Add Videos
              </PrimaryButton>
            </div>
          ) : (
            <div className="grid gap-4">
              {queueVideos.map((video) => (
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
                      {video.channel} {"\u2022"} {video.duration}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromQueue(video.id)}
                    className="inline-flex size-9 items-center justify-center rounded-xl border border-borderSoft bg-panel text-textMuted transition hover:bg-mutedPanel"
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
          <div className="w-full max-w-[560px] rounded-[20px] border border-borderSoft bg-panel p-6 shadow-dialog">
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
                className="inline-flex size-9 items-center justify-center rounded-xl border border-borderSoft bg-panel text-textMuted transition hover:bg-mutedPanel"
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
              <PrimaryButton onClick={saveQueue}>
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
