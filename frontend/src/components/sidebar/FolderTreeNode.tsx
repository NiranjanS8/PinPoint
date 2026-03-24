import { ChevronDown, ChevronRight, Folder, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { FolderTreeItem } from "../../types/workspace";

export function FolderTreeNode({
  node,
  depth,
  selectedFolderId,
  expandedIds,
  onToggleExpand,
  onSelect,
  onCreateSubfolder,
  onRename,
  onDelete
}: {
  node: FolderTreeItem;
  depth: number;
  selectedFolderId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onCreateSubfolder: (node: FolderTreeItem) => void;
  onRename: (node: FolderTreeItem) => void;
  onDelete: (node: FolderTreeItem) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedFolderId === node.id;

  return (
    <div className="grid gap-1">
      <div
        className={`group flex min-h-11 items-center gap-1 rounded-xl pr-2 ${isSelected ? "bg-[var(--color-surface-selected)]" : "hover:bg-[var(--color-surface-hover)]"}`}
        style={{ paddingLeft: `${14 + depth * 14}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          type="button"
          onClick={() => hasChildren && onToggleExpand(node.id)}
          className="inline-flex size-6 items-center justify-center rounded-md text-textMuted"
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />
          ) : (
            <span className="size-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={`flex min-w-0 flex-1 items-center gap-3 text-left text-[17px] ${isSelected ? "font-semibold text-textStrong" : "text-textMuted"}`}
        >
          <Folder className="size-[18px] shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>

        <div className={`flex items-center gap-1 ${hovered || isSelected ? "opacity-100" : "opacity-0"} transition`}>
          <TreeActionButton onClick={() => onCreateSubfolder(node)} label="Add subfolder">
            <FolderPlus className="size-3.5" />
          </TreeActionButton>
          <TreeActionButton onClick={() => onRename(node)} label="Rename folder">
            <Pencil className="size-3.5" />
          </TreeActionButton>
          <TreeActionButton onClick={() => onDelete(node)} label="Delete folder">
            <Trash2 className="size-3.5" />
          </TreeActionButton>
        </div>
      </div>

      {hasChildren && isExpanded ? (
        <div className="grid gap-1">
          {node.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
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
      ) : null}
    </div>
  );
}

function TreeActionButton({
  children,
  onClick,
  label
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-6 items-center justify-center rounded-md text-textMuted hover:bg-mutedPanel hover:text-textStrong"
    >
      {children}
    </button>
  );
}
