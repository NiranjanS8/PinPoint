import {
  AppWindow,
  CornerDownLeft,
  Folder,
  FolderOpen,
  Library,
  ListTodo,
  Plus,
  Search,
  Sparkles
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useToast } from "../../context/ToastContext";
import { useWorkspaceUi } from "../../context/WorkspaceUiContext";
import type { FolderTreeItem } from "../../types/workspace";
import { getBestMatchRanges, getContentSearchScore } from "../../utils/search";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenAddVideo: () => void;
}

type PaletteItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  keywords: string;
  action: () => void | Promise<void>;
};

export function CommandPalette({ open, onClose, onOpenAddVideo }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { videos, folderTree, addQueueItem } = useContent();
  const { showToast } = useToast();
  const { activeContentId } = useWorkspaceUi();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeVideo = videos.find((video) => Number(video.id) === activeContentId) ?? null;

  const items = useMemo<PaletteItem[]>(() => {
    const baseItems: PaletteItem[] = [
      {
        id: "action-add-video",
        title: "Add YouTube link",
        subtitle: "Save a new video or playlist to your library",
        icon: <Plus className="size-4" />,
        keywords: "add create save youtube link video playlist",
        action: () => {
          onClose();
          onOpenAddVideo();
        }
      },
      {
        id: "action-focus-mode",
        title: "Start focus mode",
        subtitle: "Open the study session queue and timer",
        icon: <Sparkles className="size-4" />,
        keywords: "focus mode study session timer",
        action: () => {
          onClose();
          navigate("/study-session");
        }
      },
      {
        id: "action-library",
        title: "Open Library",
        subtitle: "Return to the main learning workspace",
        icon: <Library className="size-4" />,
        keywords: "library home all content",
        action: () => {
          onClose();
          navigate("/");
        }
      }
    ];

    if (activeVideo) {
      baseItems.push({
        id: "action-add-queue",
        title: `Add "${activeVideo.title}" to queue`,
        subtitle: "Send the current selection to Study Session",
        icon: <ListTodo className="size-4" />,
        keywords: `queue study add ${activeVideo.title} ${activeVideo.channel}`,
        action: async () => {
          await addQueueItem(Number(activeVideo.id));
          showToast({
            tone: "success",
            title: "Added to queue",
            description: activeVideo.title
          });
          onClose();
        }
      });

      if (window.pinpointDesktop?.openMiniPlayer) {
        baseItems.push({
          id: "action-mini-player",
          title: "Open selected content in mini player",
          subtitle: "Float the current lesson above other apps",
          icon: <AppWindow className="size-4" />,
          keywords: "mini player float picture in picture selected content",
          action: async () => {
            await window.pinpointDesktop?.openMiniPlayer?.(Number(activeVideo.id));
            onClose();
          }
        });
      }
    }

    const folderItems: PaletteItem[] = flattenFolders(folderTree).map((folder) => ({
      id: `folder-${folder.id}`,
      title: folder.name,
      subtitle: "Navigate to folder",
      icon: <Folder className="size-4" />,
      keywords: `folder ${folder.name}`,
      action: () => {
        onClose();
        navigate(`/?folderId=${folder.id}`);
      }
    }));

    const contentItems: PaletteItem[] = videos.map((video) => ({
      id: `content-${video.id}`,
      title: video.title,
      subtitle: video.channel,
      icon: <FolderOpen className="size-4" />,
      keywords: `${video.title} ${video.channel}`,
      action: () => {
        onClose();
        navigate(`/content/${video.id}`);
      }
    }));

    return [...baseItems, ...folderItems, ...contentItems];
  }, [activeVideo, addQueueItem, folderTree, navigate, onClose, onOpenAddVideo, showToast, videos]);

  const results = useMemo(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return items.slice(0, 10);
    }

    return items
      .map((item) => ({
        item,
        score:
          getContentSearchScore(trimmedQuery, item.title, item.subtitle ?? "") +
          (item.keywords.toLowerCase().includes(trimmedQuery.toLowerCase()) ? 40 : 0)
      }))
      .filter((entry) => entry.score >= 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 12)
      .map((entry) => entry.item);
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => Math.max(current - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        const selectedItem = results[selectedIndex];
        if (!selectedItem) {
          return;
        }

        event.preventDefault();
        void handleItemSelect(selectedItem);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onClose, open, results, selectedIndex]);

  async function handleItemSelect(item: PaletteItem) {
    try {
      await item.action();
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Command failed",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-start bg-[rgba(4,6,10,0.46)] px-6 pt-[12vh] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] rounded-[24px] bg-panel shadow-[0_28px_80px_rgba(0,0,0,0.42)] ring-1 ring-white/6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 pt-5">
          <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--color-surface-soft)] text-textMuted">
            <Search className="size-5" />
          </div>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search content, folders, and commands..."
            className="h-12 w-full bg-transparent text-[17px] text-textStrong outline-none placeholder:text-textMuted"
          />
          <span className="rounded-lg bg-[var(--color-surface-soft)] px-2.5 py-1 text-[12px] text-textMuted">
            Esc
          </span>
        </div>

        <div className="command-palette-scroll mt-4 max-h-[440px] overflow-y-auto px-3 pb-3">
          {results.length === 0 ? (
            <div className="grid min-h-[180px] place-items-center rounded-2xl bg-[var(--color-surface-soft)] text-center">
              <div>
                <p className="m-0 text-[16px] font-semibold text-textStrong">No results found</p>
                <p className="mt-2 text-[14px] text-textMuted">
                  Try a title, channel, folder name, or action like “focus mode”.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-1">
              {results.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void handleItemSelect(item)}
                  className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    index === selectedIndex
                      ? "bg-[var(--color-surface-selected)]"
                      : "hover:bg-[var(--color-surface-soft)]"
                  }`}
                >
                  <div className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-textMuted">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[15px] font-semibold text-textStrong">
                      <HighlightedLabel text={item.title} query={query} />
                    </p>
                    {item.subtitle ? (
                      <p className="mt-1 truncate text-[13px] text-textMuted">
                        <HighlightedLabel text={item.subtitle} query={query} />
                      </p>
                    ) : null}
                  </div>
                  <CornerDownLeft className="size-4 text-textMuted" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function flattenFolders(nodes: FolderTreeItem[]): Array<{ id: string; name: string }> {
  return nodes.flatMap((node) => [{ id: node.id, name: node.name }, ...flattenFolders(node.children)]);
}

function HighlightedLabel({ text, query }: { text: string; query: string }) {
  const ranges = getBestMatchRanges(text, query);
  if (ranges.length === 0) {
    return <>{text}</>;
  }

  const content: ReactNode[] = [];
  let cursor = 0;

  ranges.forEach(([start, end], index) => {
    if (cursor < start) {
      content.push(<span key={`plain-${index}-${cursor}`}>{text.slice(cursor, start)}</span>);
    }
    content.push(
      <mark key={`mark-${index}-${start}`} className="rounded-[4px] bg-white/12 px-[1px] text-textStrong">
        {text.slice(start, end)}
      </mark>
    );
    cursor = end;
  });

  if (cursor < text.length) {
    content.push(<span key={`plain-tail-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return <>{content}</>;
}
