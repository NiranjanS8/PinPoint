import { ArrowLeft, Check, FolderOpen, ListTodo, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { TagPill } from "../components/ui/TagPill";
import { useContent } from "../context/ContentContext";
import { useToast } from "../context/ToastContext";
import type { VideoItem } from "../types/workspace";

export function FolderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { folders, videos, assignFolder, addQueueItem, removeQueueItem, studyQueue } = useContent();
  const { showToast } = useToast();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const folder = folders.find((item) => item.id === id) ?? null;
  const folderVideos = useMemo(
    () =>
      videos
        .filter((video) => video.folderId === id)
        .sort((left, right) => left.title.localeCompare(right.title)),
    [id, videos]
  );

  const selectableVideos = useMemo(() => videos.filter((video) => video.folderId !== id), [id, videos]);
  const queueByContentId = useMemo(
    () => new Map(studyQueue.map((item) => [String(item.content.id), item.id])),
    [studyQueue]
  );

  function openAssignDialog() {
    setPendingSelection([]);
    setShowAssignDialog(true);
  }

  function closeAssignDialog() {
    if (saving) {
      return;
    }

    setPendingSelection([]);
    setShowAssignDialog(false);
  }

  function toggleVideo(idToToggle: string) {
    setPendingSelection((current) =>
      current.includes(idToToggle)
        ? current.filter((item) => item !== idToToggle)
        : [...current, idToToggle]
    );
  }

  async function handleAssignVideos() {
    if (!folder || pendingSelection.length === 0) {
      setShowAssignDialog(false);
      return;
    }

    setSaving(true);
    try {
      await Promise.all(pendingSelection.map((videoId) => assignFolder(Number(videoId), Number(folder.id))));
      showToast({
        tone: "success",
        title: "Videos added",
        description: `${pendingSelection.length} item${pendingSelection.length === 1 ? "" : "s"} added to ${folder.name}.`
      });
      setShowAssignDialog(false);
      setPendingSelection([]);
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Unable to add videos",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddToQueue(video: VideoItem) {
    try {
      await addQueueItem(Number(video.id));
      showToast({
        tone: "success",
        title: "Added to queue",
        description: video.title
      });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Queue action failed",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    }
  }

  async function handleRemoveFromQueue(video: VideoItem) {
    const queueItemId = queueByContentId.get(video.id);
    if (!queueItemId) {
      return;
    }

    try {
      await removeQueueItem(Number(queueItemId));
      showToast({
        tone: "info",
        title: "Removed from queue",
        description: video.title
      });
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Queue action failed",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    }
  }

  if (!folder) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate("/folders")}
          className="mb-7 inline-flex items-center gap-2 rounded-xl bg-[var(--color-surface-soft)] px-3.5 py-2 text-[15px] font-medium text-textStrong transition hover:bg-mutedPanel"
        >
          <ArrowLeft className="size-[17px]" strokeWidth={2.2} />
          Back to Library
        </button>
        <EmptyStateCard
          icon={<FolderOpen className="size-[54px]" strokeWidth={1.8} />}
          title="Folder not found"
          description="This folder may have been deleted or moved."
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/folders")}
        className="mb-7 inline-flex items-center gap-2 rounded-xl bg-[var(--color-surface-soft)] px-3.5 py-2 text-[15px] font-medium text-textStrong transition hover:bg-mutedPanel"
      >
        <ArrowLeft className="size-[17px]" strokeWidth={2.2} />
        Back to Library
      </button>

      <section className="rounded-shell bg-accentBlue px-10 py-8 text-white shadow-panel">
        <h1 className="m-0 text-[28px] font-bold tracking-[-0.03em]">{folder.name}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-3 text-[16px] text-white/95">
          <span>
            {folderVideos.length} {folderVideos.length === 1 ? "video" : "videos"}
          </span>
        </p>
      </section>

      <section className="mt-4 border-t border-white/5 pt-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="m-0 text-[20px] font-semibold text-textStrong">Videos</h2>
          <PrimaryButton className="min-h-[46px] px-5" onClick={openAssignDialog}>
            <Plus className="size-4" />
            Add Videos
          </PrimaryButton>
        </div>

        {folderVideos.length === 0 ? (
          <EmptyStateCard
            icon={<FolderOpen className="size-[54px]" strokeWidth={1.8} />}
            title="No videos in this folder"
            description="Add a few lessons here to build a focused path you can return to quickly."
            action={
              <PrimaryButton onClick={openAssignDialog}>
                <Plus className="size-4" />
                Add Videos
              </PrimaryButton>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {folderVideos.map((video) => (
              <FolderVideoCard
                key={video.id}
                video={video}
                isQueued={queueByContentId.has(video.id)}
                onAddToQueue={handleAddToQueue}
                onRemoveFromQueue={handleRemoveFromQueue}
              />
            ))}
          </div>
        )}
      </section>

      {showAssignDialog ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(16,24,40,0.22)] p-6">
          <div className="w-full max-w-[620px] rounded-[20px] bg-panel p-6 shadow-dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-[22px] font-semibold text-textStrong">Add Videos</h2>
                <p className="mt-1.5 text-[15px] text-textMuted">
                  Select saved content to add into {folder.name}.
                </p>
              </div>
            </div>

            <div className="app-scrollbar mt-5 max-h-[360px] overflow-y-auto">
              {selectableVideos.length === 0 ? (
                <p className="text-[15px] text-textMuted">All saved videos are already assigned to this folder.</p>
              ) : (
                <div className="grid gap-3">
                  {selectableVideos.map((video) => {
                    const selected = pendingSelection.includes(video.id);

                    return (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => toggleVideo(video.id)}
                        className={`grid grid-cols-[20px_72px_minmax(0,1fr)] items-center gap-4 rounded-2xl px-3.5 py-3 text-left transition ${
                          selected
                            ? "bg-[var(--color-surface-muted)] ring-1 ring-white/10"
                            : "bg-[var(--color-surface-soft)] hover:bg-mutedPanel"
                        }`}
                      >
                        <span
                          className={`inline-flex size-5 items-center justify-center rounded-full ${
                            selected ? "bg-accentBlue" : "bg-panel ring-1 ring-borderSoft"
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
                            {video.channel} {"•"} {video.duration}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <SecondaryButton onClick={closeAssignDialog} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={() => void handleAssignVideos()} disabled={saving || pendingSelection.length === 0}>
                <Plus className="size-4" />
                {saving ? "Adding..." : "Add Videos"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FolderVideoCard({
  video,
  isQueued,
  onAddToQueue,
  onRemoveFromQueue
}: {
  video: VideoItem;
  isQueued: boolean;
  onAddToQueue: (video: VideoItem) => void;
  onRemoveFromQueue: (video: VideoItem) => void;
}) {
  return (
    <article className="overflow-hidden rounded-shell bg-panel shadow-panel transition duration-150 hover:-translate-y-[2px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
      <Link to={`/content/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-soft)]">
          <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
          <span className="absolute bottom-3 right-3 rounded-lg bg-[rgba(15,17,21,0.82)] px-2.5 py-1 text-[12px] text-white">
            {video.duration}
          </span>
        </div>

        <div className="grid gap-2.5 px-4 py-4">
          <div>
            <h3 className="line-clamp-2 text-[16px] font-semibold leading-[1.45] text-textStrong">
              {video.title}
            </h3>
            <p className="mt-1.5 text-[13px] text-textMuted">
              {video.channel} {"•"} {video.date}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <TagPill staticStyle className="min-h-[28px] px-3 text-[12px]">
              {formatStatus(video.status)}
            </TagPill>
            {video.pinned ? (
              <TagPill staticStyle className="min-h-[28px] px-3 text-[12px]">
                Pinned
              </TagPill>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <SecondaryButton
          className={`w-full justify-center ${isQueued ? "bg-[var(--color-surface-selected)]" : ""}`}
          onClick={() => {
            if (isQueued) {
              onRemoveFromQueue(video);
              return;
            }

            onAddToQueue(video);
          }}
        >
          {isQueued ? <X className="size-4" /> : <ListTodo className="size-4" />}
          {isQueued ? "Remove from Queue" : "Add to Queue"}
        </SecondaryButton>
      </div>
    </article>
  );
}

function formatStatus(status: VideoItem["status"]) {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "IN_PROGRESS":
      return "In Progress";
    default:
      return "Not Started";
  }
}
