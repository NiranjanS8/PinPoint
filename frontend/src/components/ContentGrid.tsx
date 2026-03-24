import type { FolderOption, SavedContent } from "../types/content";
import { ContentCard } from "./ContentCard";

interface ContentGridProps {
  items: SavedContent[];
  folders: FolderOption[];
  assigningContentId: number | null;
  onOpen: (content: SavedContent) => void;
  onTogglePin: (content: SavedContent) => void;
  onDelete: (content: SavedContent) => void;
  onAssignFolder: (content: SavedContent, folderId: number | null) => void;
}

export function ContentGrid({
  items,
  folders,
  assigningContentId,
  onOpen,
  onTogglePin,
  onDelete,
  onAssignFolder
}: ContentGridProps) {
  return (
    <section className="content-grid">
      {items.map((item) => (
        <ContentCard
          key={item.id}
          content={item}
          folders={folders}
          isAssigning={assigningContentId === item.id}
          onOpen={onOpen}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          onAssignFolder={onAssignFolder}
        />
      ))}
    </section>
  );
}
