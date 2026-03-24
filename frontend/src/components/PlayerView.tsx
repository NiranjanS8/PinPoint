import type { SavedContent } from "../types/content";
import { buildEmbedUrl } from "../utils/youtube";

interface PlayerViewProps {
  content: SavedContent;
  onClose: () => void;
}

export function PlayerView({ content, onClose }: PlayerViewProps) {
  const embedUrl = buildEmbedUrl(content);

  async function handleOpenInBrowser() {
    if (window.pinpointDesktop?.openExternal) {
      await window.pinpointDesktop.openExternal(content.url);
      return;
    }

    window.open(content.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel player-panel">
        <div className="modal-header">
          <div>
            <h2>{content.title}</h2>
            <p>{content.channelName}</p>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="player-frame-wrap">
          <iframe
            className="player-frame"
            src={embedUrl}
            title={content.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={handleOpenInBrowser}>
            Open in Browser
          </button>
        </div>
      </div>
    </div>
  );
}
