import { FolderOpen, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { useContent } from "../context/ContentContext";

export function AppLayout({ children }: PropsWithChildren) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("pinpoint-theme") === "dark";
  });
  const { addContent } = useContent();

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowAddDialog(true);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

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
      await addContent(trimmedUrl);
      setVideoUrl("");
      setShowAddDialog(false);
    } catch (exception) {
      setSubmitError(exception instanceof Error ? exception.message : "Failed to save content.");
    } finally {
      setSubmitting(false);
    }
  }

  function openAddDialog() {
    setSubmitError(null);
    setShowAddDialog(true);
  }

  function closeAddDialog() {
    if (submitting) {
      return;
    }

    setSubmitError(null);
    setVideoUrl("");
    setShowAddDialog(false);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-shell">
      <AppSidebar
        onOpenAddVideo={openAddDialog}
        onToggleDarkMode={() => setIsDarkMode((current) => !current)}
        isDarkMode={isDarkMode}
      />
      <main className="app-scrollbar flex-1 h-screen overflow-y-auto overflow-x-hidden px-11 py-10">
        {children}
      </main>

      {showAddDialog ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(16,24,40,0.22)] p-6">
          <div className="w-full max-w-[440px] rounded-[20px] border border-borderSoft bg-panel p-6 shadow-dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-[22px] font-semibold text-textStrong">Add Video</h2>
                <p className="mt-1.5 text-[15px] text-textMuted">
                  Paste a YouTube video or playlist link.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddDialog}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-borderSoft bg-panel text-textMuted transition hover:bg-mutedPanel"
                disabled={submitting}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-textStrong">YouTube URL</span>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v="
                  className="min-h-[46px] rounded-[14px] border border-borderSoft bg-mutedPanel px-4 text-sm text-textStrong outline-none"
                  disabled={submitting}
                />
              </label>

              {!isValidYoutube ? (
                <p className="m-0 text-sm text-[#b42318]">
                  Please use a valid YouTube video or playlist link.
                </p>
              ) : null}

              {submitError ? <p className="m-0 text-sm text-[#b42318]">{submitError}</p> : null}

              <div className="flex justify-end gap-3">
                <SecondaryButton onClick={closeAddDialog} disabled={submitting}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton onClick={() => void handleAddVideo()} disabled={submitting}>
                  <Plus className="size-4" />
                  {submitting ? "Saving..." : "Add Video"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="hidden">
        <FolderOpen />
      </div>
    </div>
  );
}
