import { Archive, BarChart3, Clock3, Folder, FolderPlus, Library, Moon, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useToast } from "../../context/ToastContext";
import type { FolderTreeItem } from "../../types/workspace";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";
import { SidebarNavItem } from "../ui/SidebarNavItem";
import { FolderDialog } from "./FolderDialog";
import { FolderTree } from "./FolderTree";

const primaryLinks = [
  { to: "/", label: "Library", icon: <Library className="size-[18px]" /> },
  { to: "/archived", label: "Archived", icon: <Archive className="size-[18px]" /> }
];

const secondaryLinks = [
  { to: "/analytics", label: "Analytics", icon: <BarChart3 className="size-[18px]" /> },
  { to: "/study-session", label: "Study Session", icon: <Clock3 className="size-[18px]" /> }
];

type FolderDialogState =
  | { mode: "create"; parentId: number | null; title: string; description: string; initialName?: string }
  | { mode: "rename"; folderId: number; parentId: number | null; title: string; description: string; initialName: string }
  | null;

export function AppSidebar({
  onOpenAddVideo,
  onToggleDarkMode,
  isDarkMode
}: {
  onOpenAddVideo: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { folderTree, createFolder, renameFolder, removeFolder } = useContent();
  const { showToast } = useToast();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [dialogState, setDialogState] = useState<FolderDialogState>(null);

  const selectedFolderId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("folderId");
  }, [location.search]);

  useEffect(() => {
    setExpandedIds((current) => {
      const next = new Set(current);
      collectFolderIds(folderTree).forEach((id) => next.add(id));
      return next;
    });
  }, [folderTree]);

  function toggleExpand(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSelectFolder(id: string) {
    navigate(`/?folderId=${id}`);
  }

  function handleCreateRootFolder() {
    setDialogState({
      mode: "create",
      parentId: null,
      title: "Create Folder",
      description: "Add a top-level topic folder to organize your content."
    });
  }

  function handleCreateSubfolder(folder: FolderTreeItem) {
    setDialogState({
      mode: "create",
      parentId: Number(folder.id),
      title: "Create Subfolder",
      description: `Add a nested folder inside ${folder.name}.`
    });
  }

  function handleRenameFolder(folder: FolderTreeItem) {
    setDialogState({
      mode: "rename",
      folderId: Number(folder.id),
      parentId: folder.parentId !== null ? Number(folder.parentId) : null,
      title: "Rename Folder",
      description: "Update the folder name while keeping its current location.",
      initialName: folder.name
    });
  }

  async function handleDeleteFolder(folder: FolderTreeItem) {
    const confirmed = window.confirm(
      `Delete "${folder.name}" and all of its subfolders? Content inside them will become unassigned.`
    );
    if (!confirmed) {
      return;
    }

    try {
      await removeFolder(Number(folder.id));
      showToast({
        tone: "success",
        title: "Folder deleted",
        description: folder.name
      });
      if (selectedFolderId && folderContainsId(folder, selectedFolderId)) {
        navigate("/");
      }
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Unable to delete folder",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    }
  }

  async function handleDialogSubmit(name: string) {
    if (!dialogState) {
      return;
    }

    if (dialogState.mode === "create") {
      await createFolder(name, dialogState.parentId);
      showToast({
        tone: "success",
        title: "Folder created",
        description: name
      });
      return;
    }

    await renameFolder(dialogState.folderId, name, dialogState.parentId);
    showToast({
      tone: "success",
      title: "Folder updated",
      description: name
    });
  }

  return (
    <>
      <aside className="flex h-screen w-[296px] shrink-0 flex-col border-r border-borderSoft bg-sidebar">
        <div className="px-[30px] pb-7 pt-[34px]">
          <h1 className="m-0 text-[27px] font-bold leading-[1.15] tracking-[-0.03em] text-textStrong">
            Pinpoint
          </h1>
          <p className="mt-2 text-sm text-textMuted">Learning Workspace</p>
        </div>

        <nav className="app-scrollbar overflow-y-auto px-3.5 pt-[18px]">
          <div className="grid gap-1">
            {primaryLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/"}
                className="block w-full"
              >
                {({ isActive }) => (
                  <SidebarNavItem
                    active={item.to === "/" ? location.pathname === "/" || location.pathname === "/library" : isActive}
                    icon={item.icon}
                    label={item.label}
                  />
                )}
              </NavLink>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-2 flex min-h-11 items-center justify-between rounded-xl px-4">
              <div className="flex items-center gap-3 text-left text-[17px] text-textMuted">
                <Folder className="size-[18px]" />
                <span className="font-normal">Folders</span>
              </div>
              <button
                type="button"
                onClick={handleCreateRootFolder}
                className="inline-flex size-9 items-center justify-center rounded-xl bg-navy text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_6px_18px_rgba(0,0,0,0.18)] transition duration-150 hover:-translate-y-[1px] hover:brightness-105"
                aria-label="Create folder"
              >
                <FolderPlus className="size-4" />
              </button>
            </div>

            {folderTree.length > 0 ? (
              <FolderTree
                nodes={folderTree}
                selectedFolderId={selectedFolderId}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                onSelect={handleSelectFolder}
                onCreateSubfolder={handleCreateSubfolder}
                onRename={handleRenameFolder}
                onDelete={(node) => void handleDeleteFolder(node)}
              />
            ) : (
              <div className="px-4 py-2 text-[15px] leading-6 text-textMuted">
                No folders yet. Create one to organize your topics.
              </div>
            )}
          </div>

          <div className="my-6" />

          <div className="grid gap-1">
            {secondaryLinks.map((item) => (
              <NavLink key={item.to} to={item.to} className="block w-full">
                {({ isActive }) => (
                  <SidebarNavItem
                    active={isActive || location.pathname === item.to}
                    icon={item.icon}
                    label={item.label}
                  />
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mt-auto grid gap-2.5 p-[18px]">
          <SecondaryButton className="justify-center" onClick={onToggleDarkMode}>
            <Moon className="size-4" />
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </SecondaryButton>
          <PrimaryButton className="justify-start" onClick={onOpenAddVideo}>
            <Plus className="size-4" />
            <span>Add Video</span>
            <span className="ml-auto text-sm text-white/60">Ctrl+K</span>
          </PrimaryButton>
        </div>
      </aside>

      <FolderDialog
        open={dialogState !== null}
        title={dialogState?.title ?? ""}
        description={dialogState?.description ?? ""}
        initialName={dialogState?.initialName ?? ""}
        onClose={() => setDialogState(null)}
        onSubmit={handleDialogSubmit}
      />
    </>
  );
}

function collectFolderIds(nodes: FolderTreeItem[]): string[] {
  return nodes.flatMap((node) => [node.id, ...collectFolderIds(node.children)]);
}

function folderContainsId(node: FolderTreeItem, targetId: string): boolean {
  if (node.id === targetId) {
    return true;
  }

  return node.children.some((child) => folderContainsId(child, targetId));
}
