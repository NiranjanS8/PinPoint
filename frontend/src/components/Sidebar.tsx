import { Button } from "./Button";
import { FolderTree } from "./FolderTree";
import type { FolderTreeNode, NavigationState } from "../types/content";

interface SidebarProps {
  folderTree: FolderTreeNode[];
  expandedFolderIds: Set<number>;
  navigation: NavigationState;
  onNavigate: (navigation: NavigationState) => void;
  onToggleFolder: (folderId: number) => void;
  onCreateRootFolder: () => void;
  onCreateSubfolder: (parentId: number) => void;
  onRenameFolder: (folder: FolderTreeNode) => void;
  onDeleteFolder: (folder: FolderTreeNode) => void;
}

const NAV_ITEMS: NavigationState[] = [
  { type: "HOME", label: "Home" },
  { type: "PINNED", label: "Pinned" },
  { type: "RECENT", label: "Recent" }
];

export function Sidebar({
  folderTree,
  expandedFolderIds,
  navigation,
  onNavigate,
  onToggleFolder,
  onCreateRootFolder,
  onCreateSubfolder,
  onRenameFolder,
  onDeleteFolder
}: SidebarProps) {
  return (
    <aside className="sidebar surface">
      <div className="sidebar-brand">
        <p className="eyebrow">Desktop YouTube Organizer</p>
        <h1>Pinpoint</h1>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.type}
            type="button"
            className={`sidebar-link ${navigation.type === item.type ? "active" : ""}`}
            onClick={() => onNavigate(item)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <h2>Folders</h2>
          <Button variant="ghost" size="sm" onClick={onCreateRootFolder}>
            New
          </Button>
        </div>

        <FolderTree
          nodes={folderTree}
          expandedIds={expandedFolderIds}
          selectedFolderId={navigation.type === "FOLDER" ? navigation.folderId : undefined}
          onToggle={onToggleFolder}
          onSelect={(folderId, label) => onNavigate({ type: "FOLDER", folderId, label })}
          onCreateSubfolder={onCreateSubfolder}
          onRename={onRenameFolder}
          onDelete={onDeleteFolder}
        />
      </div>
    </aside>
  );
}
