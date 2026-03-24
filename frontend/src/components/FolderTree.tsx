import type { FolderTreeNode as FolderTreeNodeType } from "../types/content";
import { FolderTreeNode } from "./FolderTreeNode";

interface FolderTreeProps {
  nodes: FolderTreeNodeType[];
  expandedIds: Set<number>;
  selectedFolderId?: number;
  onToggle: (folderId: number) => void;
  onSelect: (folderId: number, label: string) => void;
  onCreateSubfolder: (parentId: number) => void;
  onRename: (node: FolderTreeNodeType) => void;
  onDelete: (node: FolderTreeNodeType) => void;
}

export function FolderTree(props: FolderTreeProps) {
  if (props.nodes.length === 0) {
    return <p className="sidebar-empty">No folders yet.</p>;
  }

  return (
    <div className="folder-tree">
      {props.nodes.map((node) => (
        <FolderTreeNode key={node.id} node={node} depth={0} {...props} />
      ))}
    </div>
  );
}
