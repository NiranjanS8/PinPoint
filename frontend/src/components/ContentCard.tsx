import type { SavedContent } from "../types/content";
import { Button } from "./Button";

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
          <h3 className="truncate-two-lines">{content.title}</h3>
          <p className="truncate-one-line">{content.channelName}</p>
        </div>

        <div className="card-actions">
          <Button variant="primary" size="sm" onClick={() => onOpen(content)}>
            Play
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onTogglePin(content)}>
            {content.pinned ? "Unpin" : "Pin"}
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(content)}>
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
