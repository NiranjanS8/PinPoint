import { FolderOpen, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { CommandPalette } from "../components/ui/CommandPalette";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { ToastViewport } from "../components/ui/ToastViewport";
import { useContent } from "../context/ContentContext";
import { useToast } from "../context/ToastContext";
import { useWorkspaceUi } from "../context/WorkspaceUiContext";

export function AppLayout({ children }: PropsWithChildren) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [pendingCreatedContentId, setPendingCreatedContentId] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("pinpoint-theme") === "dark";
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { addContent, items, pinContent, removeContent, addQueueItem, updateWorkflow } = useContent();
  const { showToast } = useToast();
  const { activeContentId, isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useWorkspaceUi();

  const activeContent = items.find((item) => item.id === activeContentId) ?? null;
  const pendingCreatedContent = items.find((item) => item.id === pendingCreatedContentId) ?? null;

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommandPalette();
        return;
      }

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (showAddDialog || isCommandPaletteOpen || isTypingTarget) {
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        navigate("/study-session");
        return;
      }

      if (event.key === "Enter" && activeContent) {
        event.preventDefault();
        navigate(`/content/${activeContent.id}`);
        return;
      }

      if (!activeContent) {
        return;
      }

      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        void pinContent(activeContent.id)
          .then((updated) => {
            showToast({
              tone: "success",
              title: updated.pinned ? "Pinned" : "Unpinned",
              description: updated.title
            });
          })
          .catch((exception) => {
            showToast({
              tone: "error",
              title: "Pin action failed",
              description: exception instanceof Error ? exception.message : "Unable to update content."
            });
          });
        return;
      }

      if (event.key.toLowerCase() === "q") {
        event.preventDefault();
        void addQueueItem(activeContent.id)
          .then(() => {
            showToast({
              tone: "success",
              title: "Added to queue",
              description: activeContent.title
            });
          })
          .catch((exception) => {
            showToast({
              tone: "error",
              title: "Queue action failed",
              description: exception instanceof Error ? exception.message : "Unable to update the study queue."
            });
          });
        return;
      }

      if (event.key === "Delete") {
        event.preventDefault();
        const confirmed = window.confirm(`Delete "${activeContent.title}"?`);
        if (!confirmed) {
          return;
        }

        void removeContent(activeContent.id)
          .then(() => {
            showToast({
              tone: "success",
              title: "Deleted",
              description: activeContent.title
            });
            if (location.pathname.startsWith("/content/")) {
              navigate("/");
            }
          })
          .catch((exception) => {
            showToast({
              tone: "error",
              title: "Delete failed",
              description: exception instanceof Error ? exception.message : "Unable to remove content."
            });
          });
        return;
      }

      if (event.code === "Space" && location.pathname.startsWith("/content/")) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("pinpoint:content-play-toggle"));
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [
    activeContent,
    addQueueItem,
    closeCommandPalette,
    isCommandPaletteOpen,
    location.pathname,
    navigate,
    openCommandPalette,
    pinContent,
    removeContent,
    showAddDialog,
    showToast
  ]);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    window.localStorage.setItem("pinpoint-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const isValidYoutube = useMemo(() => {
    if (videoUrl.trim().length === 0) {
      return true;
    }
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(videoUrl.trim());
  }, [videoUrl]);

  async function handleAddVideo() {
    const trimmedUrl = videoUrl.trim();

    if (trimmedUrl.length === 0) {
      setSubmitError("Please enter a YouTube video or playlist link.");
      return;
    }

    if (!isValidYoutube) {
      setSubmitError("Please use a valid YouTube video or playlist link.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const created = await addContent(trimmedUrl);
      setPendingCreatedContentId(created.id);
      setSelectedTags(getSuggestedTags(created.title, created.contentType));
      setTagInput("");
      showToast({
        tone: "success",
        title: created.contentType === "PLAYLIST" ? "Playlist added" : "Video added",
        description: "Add a few tags to organize it right away."
      });
    } catch (exception) {
      setSubmitError(exception instanceof Error ? exception.message : "Failed to save content.");
      showToast({
        tone: "error",
        title: "Unable to add content",
        description: exception instanceof Error ? exception.message : "Failed to save content."
      });
    } finally {
      setSubmitting(false);
    }
  }

  function openAddDialog() {
    closeCommandPalette();
    setSubmitError(null);
    setShowAddDialog(true);
  }

  function closeAddDialog() {
    if (submitting) {
      return;
    }

    setSubmitError(null);
    setVideoUrl("");
    setTagInput("");
    setSelectedTags([]);
    setPendingCreatedContentId(null);
    setShowAddDialog(false);
  }

  function toggleSuggestedTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
    );
  }

  function addCustomTag() {
    const normalized = normalizeTag(tagInput);
    if (!normalized) {
      return;
    }

    setSelectedTags((current) => (current.includes(normalized) ? current : [...current, normalized]));
    setTagInput("");
  }

  async function handleSaveTags() {
    if (!pendingCreatedContentId) {
      closeAddDialog();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await updateWorkflow(pendingCreatedContentId, {
        tags: selectedTags.join(",")
      });
      closeAddDialog();
      showToast({
        tone: "success",
        title: "Tags saved",
        description: "Your content is organized and ready in Home."
      });
    } catch (exception) {
      setSubmitError(exception instanceof Error ? exception.message : "Failed to save tags.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-shell">
      <AppSidebar
        onOpenAddVideo={openAddDialog}
        onToggleDarkMode={() => setIsDarkMode((current) => !current)}
        isDarkMode={isDarkMode}
      />
      <main className="app-scrollbar flex-1 h-screen overflow-y-auto overflow-x-hidden px-9 py-8">
        {children}
      </main>

      {showAddDialog ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(16,24,40,0.22)] p-6">
          <div className="w-full max-w-[440px] rounded-[20px] bg-panel p-6 shadow-dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-[22px] font-semibold text-textStrong">
                  {pendingCreatedContentId ? "Add Tags" : "Add Video"}
                </h2>
                <p className="mt-1.5 text-[15px] text-textMuted">
                  {pendingCreatedContentId
                    ? "Choose a few tags now or add your own custom tags."
                    : "Paste a YouTube video or playlist link."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddDialog}
                className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-textMuted transition hover:bg-mutedPanel"
                disabled={submitting}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {!pendingCreatedContentId ? (
                <>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-textStrong">YouTube URL</span>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(event) => setVideoUrl(event.target.value)}
                      placeholder="https://www.youtube.com/watch?v="
                      className="min-h-[46px] rounded-[14px] bg-mutedPanel px-4 text-sm text-textStrong outline-none ring-1 ring-inset ring-borderSoft focus:ring-white/10"
                      disabled={submitting}
                    />
                  </label>

                  {!isValidYoutube ? (
                    <p className="m-0 text-sm text-[#b42318]">
                      Please use a valid YouTube video or playlist link.
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="rounded-[16px] bg-[var(--color-surface-soft)] px-4 py-3">
                    <p className="text-[13px] text-textMuted">Saved</p>
                    <p className="mt-1 text-[15px] font-medium text-textStrong">{pendingCreatedContent?.title}</p>
                  </div>

                  <div className="grid gap-2">
                    <span className="text-sm font-medium text-textStrong">Suggested Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {getSuggestedTags(
                        pendingCreatedContent?.title ?? "",
                        pendingCreatedContent?.contentType ?? "VIDEO"
                      ).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleSuggestedTag(tag)}
                          className={`inline-flex min-h-[32px] items-center rounded-full px-3 text-sm transition ${
                            selectedTags.includes(tag)
                              ? "bg-[var(--color-surface-selected)] text-textStrong"
                              : "bg-[var(--color-surface-soft)] text-textMuted hover:bg-[var(--color-surface-hover)] hover:text-textStrong"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <span className="text-sm font-medium text-textStrong">Custom Tag</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(event) => setTagInput(event.target.value)}
                        placeholder="spring-boot"
                        className="min-h-[46px] flex-1 rounded-[14px] bg-mutedPanel px-4 text-sm text-textStrong outline-none ring-1 ring-inset ring-borderSoft focus:ring-white/10"
                        disabled={submitting}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomTag();
                          }
                        }}
                      />
                      <SecondaryButton onClick={addCustomTag} disabled={submitting}>
                        Add
                      </SecondaryButton>
                    </div>
                  </div>

                  {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleSuggestedTag(tag)}
                          className="inline-flex min-h-[32px] items-center gap-2 rounded-full bg-[var(--color-surface-selected)] px-3 text-sm text-textStrong"
                        >
                          {tag}
                          <X className="size-3.5" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              )}

              {submitError ? <p className="m-0 text-sm text-[#b42318]">{submitError}</p> : null}

              <div className="flex justify-end gap-3">
                <SecondaryButton onClick={closeAddDialog} disabled={submitting}>
                  Cancel
                </SecondaryButton>
                {!pendingCreatedContentId ? (
                  <PrimaryButton onClick={() => void handleAddVideo()} disabled={submitting}>
                    <Plus className="size-4" />
                    {submitting ? "Saving..." : "Add Video"}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton onClick={() => void handleSaveTags()} disabled={submitting}>
                    <Plus className="size-4" />
                    {submitting ? "Saving..." : "Save Tags"}
                  </PrimaryButton>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <CommandPalette open={isCommandPaletteOpen} onClose={closeCommandPalette} onOpenAddVideo={openAddDialog} />
      <ToastViewport />

      <div className="hidden">
        <FolderOpen />
      </div>
    </div>
  );
}

function normalizeTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getSuggestedTags(title: string, contentType: "VIDEO" | "PLAYLIST") {
  const normalized = title.toLowerCase();
  const suggestions = new Set<string>();

  if (normalized.includes("spring")) suggestions.add("spring");
  if (normalized.includes("boot")) suggestions.add("spring-boot");
  if (normalized.includes("redis")) suggestions.add("redis");
  if (normalized.includes("react")) suggestions.add("react");
  if (normalized.includes("javascript")) suggestions.add("javascript");
  if (normalized.includes("python")) suggestions.add("python");
  if (normalized.includes("django")) suggestions.add("django");
  if (normalized.includes("api")) suggestions.add("apis");
  if (normalized.includes("system design")) suggestions.add("system-design");
  if (normalized.includes("backend")) suggestions.add("backend");
  if (normalized.includes("frontend")) suggestions.add("frontend");

  suggestions.add(contentType === "PLAYLIST" ? "playlist" : "video");
  suggestions.add("youtube");

  return Array.from(suggestions).slice(0, 6);
}
