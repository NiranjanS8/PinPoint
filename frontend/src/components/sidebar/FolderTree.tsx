import type { FolderTreeItem } from "../../types/workspace";
import { FolderTreeNode } from "./FolderTreeNode";

export function FolderTree({
  nodes,
  selectedFolderId,
  expandedIds,
  onToggleExpand,
  onSelect,
  onCreateSubfolder,
  onRename,
  onDelete
}: {
  nodes: FolderTreeItem[];
  selectedFolderId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onCreateSubfolder: (node: FolderTreeItem) => void;
  onRename: (node: FolderTreeItem) => void;
  onDelete: (node: FolderTreeItem) => void;
}) {
  return (
    <div className="grid gap-1">
      {nodes.map((node) => (
        <FolderTreeNode
          key={node.id}
          node={node}
          depth={0}
          selectedFolderId={selectedFolderId}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          onSelect={onSelect}
          onCreateSubfolder={onCreateSubfolder}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
