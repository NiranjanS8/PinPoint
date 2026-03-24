import type { SavedContent } from "../types/content";
import { ContentCard } from "./ContentCard";

interface ContentGridProps {
  items: SavedContent[];
  onOpen: (content: SavedContent) => void;
  onTogglePin: (content: SavedContent) => void;
  onDelete: (content: SavedContent) => void;
}

export function ContentGrid({ items, onOpen, onTogglePin, onDelete }: ContentGridProps) {
  return (
    <section className="content-grid">
      {items.map((item) => (
        <ContentCard
          key={item.id}
          content={item}
          onOpen={onOpen}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
