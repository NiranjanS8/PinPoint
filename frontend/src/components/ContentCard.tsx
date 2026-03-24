import type { SavedContent } from "../types/content";

interface ContentCardProps {
  content: SavedContent;
  onOpen: (content: SavedContent) => void;
  onTogglePin: (content: SavedContent) => void;
  onDelete: (content: SavedContent) => void;
}

export function ContentCard({ content, onOpen, onTogglePin, onDelete }: ContentCardProps) {
  return (
    <article className="content-card surface">
      <div className="thumbnail-wrap">
        <img src={content.thumbnailUrl} alt={content.title} className="thumbnail" />
        <div className="card-type">{content.contentType}</div>
      </div>

      <div className="card-body">
        <div className="card-copy">
          <h3>{content.title}</h3>
          <p>{content.channelName}</p>
        </div>

        <div className="card-actions">
          <button type="button" className="secondary-button" onClick={() => onOpen(content)}>
            Play
          </button>
          <button type="button" className="ghost-button" onClick={() => onTogglePin(content)}>
            {content.pinned ? "Unpin" : "Pin"}
          </button>
          <button type="button" className="danger-button" onClick={() => onDelete(content)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
