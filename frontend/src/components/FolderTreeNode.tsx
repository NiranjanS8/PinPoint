import type { FolderTreeNode as FolderTreeNodeType } from "../types/content";
import { FolderActionsMenu } from "./FolderActionsMenu";

interface FolderTreeNodeProps {
  node: FolderTreeNodeType;
  depth: number;
  expandedIds: Set<number>;
  selectedFolderId?: number;
  onToggle: (folderId: number) => void;
  onSelect: (folderId: number, label: string) => void;
  onCreateSubfolder: (parentId: number) => void;
  onRename: (node: FolderTreeNodeType) => void;
  onDelete: (node: FolderTreeNodeType) => void;
}

export function FolderTreeNode({
  node,
  depth,
  expandedIds,
  selectedFolderId,
  onToggle,
  onSelect,
  onCreateSubfolder,
  onRename,
  onDelete
}: FolderTreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedFolderId === node.id;

  return (
    <div className="folder-tree-branch">
      <div
        className={`folder-node ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <button
          type="button"
          className={`folder-node-main ${isSelected ? "selected" : ""}`}
          onClick={() => onSelect(node.id, node.name)}
        >
          <span
            className={`folder-chevron ${hasChildren ? "visible" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              if (hasChildren) {
                onToggle(node.id);
              }
            }}
          >
            {hasChildren ? (isExpanded ? "v" : ">") : ""}
          </span>
          <span className="folder-name truncate-one-line">{node.name}</span>
        </button>

        <FolderActionsMenu
          onCreateSubfolder={() => onCreateSubfolder(node.id)}
          onRename={() => onRename(node)}
          onDelete={() => onDelete(node)}
        />
      </div>

      {hasChildren && isExpanded
        ? node.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedFolderId={selectedFolderId}
              onToggle={onToggle}
              onSelect={onSelect}
              onCreateSubfolder={onCreateSubfolder}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))
        : null}
    </div>
  );
}
