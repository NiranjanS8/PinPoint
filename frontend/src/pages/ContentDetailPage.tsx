import { ExternalLink, Pin, Play, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { SectionCard } from "../components/ui/SectionCard";
import { TagPill } from "../components/ui/TagPill";
import { useContent } from "../context/ContentContext";
import { fetchContentById } from "../services/contentApi";
import type { SavedContentDto } from "../types/api";

export function ContentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, pinContent, removeContent } = useContent();
  const [content, setContent] = useState<SavedContentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

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
        setContent(existing);
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchContentById(numericId);
        setContent(response);
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : "Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    void loadContentDetail();
  }, [id, items]);

  const embedUrl = useMemo(() => {
    if (!content) {
      return null;
    }

    return toEmbedUrl(content.url, content.contentType);
  }, [content]);

  async function handleTogglePin() {
    if (!content) {
      return;
    }

    setProcessing(true);
    setActionError(null);

    try {
      const updated = await pinContent(content.id);
      setContent(updated);
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
      navigate("/library");
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : "Failed to delete content.");
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
          <p className="m-0 text-[16px] text-[#b42318]">{error ?? "Content not found."}</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={content.title} subtitle={content.channelName} />

      <div className="mt-[34px] grid grid-cols-[minmax(0,1.35fr)_360px] gap-6">
        <SectionCard className="overflow-hidden p-0">
          {showPlayer && embedUrl ? (
            <div className="aspect-video w-full overflow-hidden bg-[#0f172a]">
              <iframe
                src={embedUrl}
                title={content.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="grid place-items-center gap-5 bg-[var(--color-surface-soft)] px-8 py-10 text-center">
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="aspect-video w-full rounded-[20px] object-cover"
              />
              <div>
                <h2 className="m-0 text-[20px] font-semibold text-textStrong">Ready to open this content</h2>
                <p className="mt-2 text-[15px] text-textMuted">
                  {embedUrl
                    ? "Launch the embedded player or open the original YouTube page."
                    : "Embedded playback is unavailable for this item. Open it in your browser instead."}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-borderSoft px-7 py-5">
            <PrimaryButton onClick={() => setShowPlayer(true)} disabled={!embedUrl}>
              <Play className="size-4 fill-current" />
              {content.contentType === "PLAYLIST" ? "Open Playlist" : "Play"}
            </PrimaryButton>
            <SecondaryButton onClick={handleOpenInBrowser}>
              <ExternalLink className="size-4" />
              Open in Browser
            </SecondaryButton>
            <SecondaryButton onClick={() => void handleTogglePin()} disabled={processing}>
              <Pin className="size-4" />
              {content.pinned ? "Unpin" : "Pin"}
            </SecondaryButton>
            <SecondaryButton onClick={() => void handleDelete()} disabled={processing}>
              <Trash2 className="size-4" />
              Delete
            </SecondaryButton>
          </div>
        </SectionCard>

        <SectionCard title="Details">
          <div className="grid gap-5">
            <DetailRow label="Channel" value={content.channelName} />
            <DetailRow label="Content Type" value={content.contentType} />
            <DetailRow label="Created" value={formatDate(content.createdAt)} />
            <DetailRow label="Pinned" value={content.pinned ? "Pinned" : "Not pinned"} />
            <div className="grid gap-2">
              <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-textMuted">
                Status
              </span>
              <div className="flex gap-2">
                <TagPill staticStyle>{content.contentType}</TagPill>
                {content.pinned ? <TagPill staticStyle>Pinned</TagPill> : null}
              </div>
            </div>
            <div className="grid gap-2">
              <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-textMuted">
                Original URL
              </span>
              <a
                href={content.url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-[15px] text-[#2563eb] underline-offset-2 hover:underline"
              >
                {content.url}
              </a>
            </div>
            {actionError ? <p className="m-0 text-sm text-[#b42318]">{actionError}</p> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-textMuted">
        {label}
      </span>
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

function toEmbedUrl(url: string, contentType: SavedContentDto["contentType"]) {
  try {
    const parsedUrl = new URL(url);

    if (contentType === "PLAYLIST") {
      const playlistId = parsedUrl.searchParams.get("list");
      return playlistId ? `https://www.youtube.com/embed/videoseries?list=${playlistId}` : null;
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    const videoId = parsedUrl.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}
