import {
  AppWindow,
  ExternalLink,
  ListTodo,
  Pin,
  Plus,
  StickyNote,
  Trash2
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { YouTubePlayer } from "../components/content/YouTubePlayer";
import { PageHeader } from "../components/ui/PageHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { SectionCard } from "../components/ui/SectionCard";
import { TagPill } from "../components/ui/TagPill";
import { useContent } from "../context/ContentContext";
import { fetchContentById } from "../services/contentApi";
import type { LearningStatus, SavedContentDto } from "../types/api";

type DetailTab = "notes" | "queue" | "details";

export function ContentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    items,
    folders,
    studyQueue,
    pinContent,
    updateWorkflow,
    updatePlaybackProgress,
    markOpened,
    addQueueItem,
    removeQueueItem,
    assignFolder,
    removeContent
  } = useContent();

  const [content, setContent] = useState<SavedContentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("notes");
  const [progressPercent, setProgressPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const openedRef = useRef(false);
  const notesHydratedRef = useRef(false);
  const contentRef = useRef<SavedContentDto | null>(null);
  const progressRef = useRef(0);
  const lastPlaybackPersistRef = useRef<{ seconds: number; progressPercent: number } | null>(null);
  const playbackPersistingRef = useRef(false);
  const playbackPersistAtRef = useRef(0);

  useEffect(() => {
    openedRef.current = false;
    notesHydratedRef.current = false;
    lastPlaybackPersistRef.current = null;
    contentRef.current = null;
    setShowPlayer(false);
  }, [id]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    progressRef.current = progressPercent;
  }, [progressPercent]);

  useEffect(() => {
    async function loadContentDetail() {
      if (!id) {
        setError("Content not found");
        setLoading(false);
        return;
      }

      const numericId = Number(id);
      const existing = items.find((item) => item.id === numericId);

      if (existing) {
        hydrateContent(existing);
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchContentById(numericId);
        hydrateContent(response);
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : "Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    void loadContentDetail();
  }, [id, items]);

  useEffect(() => {
    async function trackOpen() {
      if (!content || openedRef.current) {
        return;
      }

      openedRef.current = true;
      try {
        const updated = await markOpened(content.id);
        applyContentUpdate(updated, { preserveNotes: true, preserveProgress: true });
      } catch {
        // Keep detail usable even if open tracking fails.
      }
    }

    void trackOpen();
  }, [content, markOpened]);

  useEffect(() => {
    if (!content || !notesHydratedRef.current) {
      return;
    }

    if (notes === content.notes) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const updated = await updateWorkflow(content.id, { notes });
        applyContentUpdate(updated, { preserveNotes: true, preserveProgress: true });
      } catch (exception) {
        setActionError(exception instanceof Error ? exception.message : "Failed to save notes.");
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [content, notes, updateWorkflow]);

  const playerSource = useMemo(() => {
    if (!content) {
      return null;
    }

    return toPlayerSource(content.url, content.contentType);
  }, [content]);

  const queueEntry = useMemo(
    () => (content ? studyQueue.find((item) => item.content.id === String(content.id)) ?? null : null),
    [content, studyQueue]
  );

  const queuePreview = useMemo(() => studyQueue.slice(0, 6), [studyQueue]);

  function hydrateContent(item: SavedContentDto) {
    setContent(item);
    setProgressPercent(item.progressPercent);
    setNotes(item.notes ?? "");
    notesHydratedRef.current = true;
    contentRef.current = item;
    progressRef.current = item.progressPercent;
    lastPlaybackPersistRef.current = {
      seconds: item.lastPlaybackSeconds ?? 0,
      progressPercent: item.progressPercent
    };
  }

  function applyContentUpdate(
    item: SavedContentDto,
    options: { preserveNotes?: boolean; preserveProgress?: boolean } = {}
  ) {
    setContent(item);
    contentRef.current = item;

    if (!options.preserveProgress) {
      setProgressPercent(item.progressPercent);
      progressRef.current = item.progressPercent;
      lastPlaybackPersistRef.current = {
        seconds: item.lastPlaybackSeconds ?? 0,
        progressPercent: item.progressPercent
      };
    }

    if (!options.preserveNotes) {
      setNotes(item.notes ?? "");
    }
  }

  const persistPlayback = useCallback(
    async (seconds: number, duration: number) => {
      const currentContent = contentRef.current;
      if (!currentContent || duration <= 0 || playbackPersistingRef.current) {
        return;
      }

      const nextProgress = Math.min(100, Math.max(1, Math.round((seconds / duration) * 100)));
      const normalizedProgress = nextProgress >= 98 ? 100 : nextProgress;
      const normalizedSeconds = Math.max(0, Math.floor(seconds));
      const previous = lastPlaybackPersistRef.current;
      const now = Date.now();

      if (
        previous &&
        normalizedProgress === previous.progressPercent &&
        Math.abs(normalizedSeconds - previous.seconds) < 5
      ) {
        return;
      }

      if (now - playbackPersistAtRef.current < 5000) {
        return;
      }

      playbackPersistAtRef.current = now;
      playbackPersistingRef.current = true;

      try {
        const updated = await updatePlaybackProgress(currentContent.id, {
          progressPercent: normalizedProgress,
          status: normalizedProgress >= 100 ? "COMPLETED" : "IN_PROGRESS",
          lastPlaybackSeconds: normalizedSeconds
        });

        setProgressPercent(normalizedProgress);
        progressRef.current = normalizedProgress;
        applyContentUpdate(updated, { preserveNotes: true, preserveProgress: true });
        lastPlaybackPersistRef.current = {
          seconds: normalizedSeconds,
          progressPercent: normalizedProgress
        };
      } catch (exception) {
        setActionError(exception instanceof Error ? exception.message : "Failed to sync playback progress.");
      } finally {
        playbackPersistingRef.current = false;
      }
    },
    [updatePlaybackProgress]
  );

  const handlePlayerProgress = useCallback(
    (seconds: number, duration: number) => {
      if (duration <= 0) {
        return;
      }

      const nextProgress = Math.min(100, Math.max(1, Math.round((seconds / duration) * 100)));
      setProgressPercent(nextProgress >= 98 ? 100 : nextProgress);
      void persistPlayback(seconds, duration);
    },
    [persistPlayback]
  );

  const handlePlaybackEnded = useCallback(async () => {
    const currentContent = contentRef.current;
    if (!currentContent) {
      return;
    }

    try {
      const updated = await updatePlaybackProgress(currentContent.id, {
        progressPercent: 100,
        status: "COMPLETED",
        lastPlaybackSeconds: currentContent.lastPlaybackSeconds ?? 0
      });
      setProgressPercent(100);
      applyContentUpdate(updated, { preserveNotes: true, preserveProgress: true });
      lastPlaybackPersistRef.current = {
        seconds: updated.lastPlaybackSeconds ?? currentContent.lastPlaybackSeconds ?? 0,
        progressPercent: 100
      };
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : "Failed to complete playback progress.");
    }
  }, [updatePlaybackProgress]);

  function handlePlay() {
    setShowPlayer(true);
    setActionError(null);
  }

  async function handleTogglePin() {
    if (!content) {
      return;
    }

    setProcessing(true);
    setActionError(null);

    try {
      const updated = await pinContent(content.id);
      applyContentUpdate(updated, { preserveNotes: true, preserveProgress: true });
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : "Failed to update content.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete() {
    if (!content) {
      return;
    }

    const confirmed = window.confirm(`Delete "${content.title}"?`);
    if (!confirmed) {
      return;
    }

    setProcessing(true);
    setActionError(null);

    try {
      await removeContent(content.id);
      navigate("/");
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : "Failed to delete content.");
      setProcessing(false);
    }
  }

  async function handleFolderChange(folderId: string) {
    if (!content) {
      return;
    }

    setProcessing(true);
    setActionError(null);

    try {
      const updated = await assignFolder(content.id, folderId.length > 0 ? Number(folderId) : null);
      applyContentUpdate(updated, { preserveNotes: true, preserveProgress: true });
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : "Failed to move content.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleAddToQueue() {
    if (!content) {
      return;
    }

    setProcessing(true);
    setActionError(null);

    try {
      await addQueueItem(content.id);
      setActiveTab("queue");
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : "Failed to add content to queue.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleRemoveFromQueue() {
    if (!queueEntry) {
      return;
    }

    setProcessing(true);
    setActionError(null);

    try {
      await removeQueueItem(Number(queueEntry.id));
      setActiveTab("queue");
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : "Failed to remove content from queue.");
    } finally {
      setProcessing(false);
    }
  }

  function handleOpenInBrowser() {
    if (!content) {
      return;
    }

    window.open(content.url, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Content" subtitle="Loading content details" />
        <p className="mt-[34px] text-[16px] text-textMuted">Loading your saved content...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div>
        <PageHeader title="Content" subtitle="Content detail view" />
        <SectionCard className="mt-[34px]">
          <p className="m-0 text-[16px] text-[#f97066]">{error ?? "Content not found."}</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={content.title} subtitle={content.channelName} />

      <div className="mt-[34px] grid grid-cols-[minmax(0,1.35fr)_360px] gap-6">
        <div className="grid gap-6">
          <SectionCard className="overflow-hidden p-0">
            {showPlayer && playerSource ? (
              <div className="aspect-video w-full overflow-hidden bg-[#07090d]">
                <YouTubePlayer
                  source={playerSource}
                  autoplay
                  onProgress={handlePlayerProgress}
                  onEnded={handlePlaybackEnded}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePlay}
                className="grid w-full place-items-center gap-6 bg-[#0b0d11] px-8 py-10 text-center transition hover:bg-[#101319]"
              >
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="aspect-video max-h-[420px] w-full rounded-[20px] object-cover"
                />
              </button>
            )}

            <div className="grid gap-4 px-7 py-5">
              <div className="flex flex-wrap items-center gap-3">
                {window.pinpointDesktop?.openMiniPlayer ? (
                  <SecondaryButton
                    onClick={() => {
                      const desktopApi = window.pinpointDesktop;
                      if (!desktopApi?.openMiniPlayer) {
                        return;
                      }

                      void desktopApi.openMiniPlayer(content.id);
                    }}
                  >
                    <AppWindow className="size-4" />
                    Open in Mini Player
                  </SecondaryButton>
                ) : null}
                <SecondaryButton onClick={handleOpenInBrowser}>
                  <ExternalLink className="size-4" />
                  Open in Browser
                </SecondaryButton>
                {queueEntry ? (
                  <SecondaryButton onClick={() => void handleRemoveFromQueue()} disabled={processing}>
                    <ListTodo className="size-4" />
                    Remove from Queue
                  </SecondaryButton>
                ) : (
                  <SecondaryButton onClick={() => void handleAddToQueue()} disabled={processing}>
                    <Plus className="size-4" />
                    Add to Queue
                  </SecondaryButton>
                )}
                <SecondaryButton
                  onClick={() => void handleTogglePin()}
                  disabled={processing}
                  className="px-3"
                  aria-label={content.pinned ? "Unpin content" : "Pin content"}
                  title={content.pinned ? "Unpin" : "Pin"}
                >
                  <Pin className="size-4" />
                </SecondaryButton>
                <SecondaryButton
                  onClick={() => void handleDelete()}
                  disabled={processing}
                  className="ml-auto px-3 text-[#f97066] hover:bg-[rgba(249,112,102,0.12)]"
                  aria-label="Delete content"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </SecondaryButton>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Study Workspace"
            actions={
              <div className="flex items-center gap-2 rounded-[14px] bg-[var(--color-surface-soft)] p-1">
                <TabButton
                  active={activeTab === "notes"}
                  icon={<StickyNote className="size-4" />}
                  label="Notes"
                  onClick={() => setActiveTab("notes")}
                />
                <TabButton
                  active={activeTab === "queue"}
                  icon={<ListTodo className="size-4" />}
                  label="Queue"
                  onClick={() => setActiveTab("queue")}
                />
                <TabButton
                  active={activeTab === "details"}
                  icon={<ExternalLink className="size-4" />}
                  label="Details"
                  onClick={() => setActiveTab("details")}
                />
              </div>
            }
          >
            {activeTab === "notes" ? (
              <div className="grid gap-4">
                <p className="m-0 text-[15px] text-textMuted">
                  Keep your takeaways, action items, and follow-up ideas close to the lesson while you watch.
                </p>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={12}
                  className="min-h-[280px] rounded-[18px] bg-[var(--color-surface-soft)] px-4 py-4 text-[15px] leading-7 text-textStrong outline-none"
                  placeholder="Write study notes, questions, code snippets, or ideas to revisit later."
                />
              </div>
            ) : null}

            {activeTab === "queue" ? (
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="m-0 text-[15px] text-textMuted">
                    Study queue items are available in the Study Session page for focused playback.
                  </p>
                  {queueEntry ? (
                    <SecondaryButton onClick={() => void handleRemoveFromQueue()} disabled={processing}>
                      <Trash2 className="size-4" />
                      Remove
                    </SecondaryButton>
                  ) : (
                    <PrimaryButton onClick={() => void handleAddToQueue()} disabled={processing}>
                      <Plus className="size-4" />
                      Add Current Item
                    </PrimaryButton>
                  )}
                </div>

                {queuePreview.length === 0 ? (
                  <div className="grid min-h-[220px] place-items-center rounded-[18px] bg-[var(--color-surface-soft)] px-8 text-center">
                    <div>
                      <h3 className="m-0 text-[18px] font-semibold text-textStrong">Queue is empty</h3>
                      <p className="mt-2 text-[15px] text-textMuted">
                        Add this lesson or a few related items to build a focused study run.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {queuePreview.map((item) => (
                      <div
                        key={item.id}
                        className={`grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 rounded-[18px] bg-[var(--color-surface-soft)] px-4 py-3 ${
                          item.content.id === String(content.id) ? "ring-1 ring-white/10" : ""
                        }`}
                      >
                        <img
                          src={item.content.thumbnail}
                          alt={item.content.title}
                          className="h-12 w-[72px] rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <h3 className="truncate text-[15px] font-semibold text-textStrong">{item.content.title}</h3>
                          <p className="mt-1 text-[13px] text-textMuted">
                            {item.content.channel} {"\u2022"} Position {item.position}
                          </p>
                        </div>
                        {item.content.id === String(content.id) ? <TagPill staticStyle>Current</TagPill> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "details" ? (
              <div className="grid gap-4 rounded-[18px] bg-[var(--color-surface-soft)] p-5">
                <DetailRow label="Channel" value={content.channelName} />
                <DetailRow label="Content Type" value={content.contentType} />
                <DetailRow label="Created" value={formatDate(content.createdAt)} />
                <DetailRow
                  label="Last Opened"
                  value={content.lastOpenedAt ? formatDateTime(content.lastOpenedAt) : "Not opened yet"}
                />
                <div className="grid gap-2">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-textMuted">
                    Original URL
                  </span>
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-[15px] text-[#60a5fa] underline-offset-2 hover:underline"
                  >
                    {content.url}
                  </a>
                </div>
              </div>
            ) : null}
          </SectionCard>
        </div>

        <SectionCard title="Organization">
          <div className="grid gap-4">
            <WorkflowGroup title="Folder">
              <div className="grid gap-2">
                <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-textMuted">
                  Folder
                </span>
                <select
                  value={content.folderId !== null ? String(content.folderId) : ""}
                  onChange={(event) => void handleFolderChange(event.target.value)}
                  className="min-h-11 rounded-[14px] bg-[var(--color-surface-muted)] px-4 text-[15px] text-textStrong outline-none"
                  disabled={processing}
                >
                  <option value="">Unassigned</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <TagPill staticStyle>{content.contentType}</TagPill>
                {content.pinned ? <TagPill staticStyle>Pinned</TagPill> : null}
              </div>
            </WorkflowGroup>

            {actionError ? <p className="m-0 text-sm text-[#f97066]">{actionError}</p> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function WorkflowGroup({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 rounded-[18px] bg-[var(--color-surface-soft)] p-4">
      <h3 className="m-0 text-[15px] font-semibold text-textStrong">{title}</h3>
      {children}
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[38px] items-center gap-2 rounded-[12px] px-3 text-sm font-medium transition ${
        active
          ? "bg-panel text-textStrong shadow-panel"
          : "text-textMuted hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-textMuted">{label}</span>
      <span className="text-[16px] text-textStrong">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function toPlayerSource(url: string, contentType: SavedContentDto["contentType"]) {
  try {
    const parsedUrl = new URL(url);

    if (contentType === "PLAYLIST") {
      const playlistId = parsedUrl.searchParams.get("list");
      return playlistId ? { type: "playlist" as const, listId: playlistId } : null;
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? { type: "video" as const, videoId } : null;
    }

    const videoId = parsedUrl.searchParams.get("v");
    return videoId ? { type: "video" as const, videoId } : null;
  } catch {
    return null;
  }
}
