import { useEffect, useMemo, useState } from "react";
import { AddContentForm } from "../components/AddContentForm";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ContentGrid } from "../components/ContentGrid";
import { CreateFolderDialog } from "../components/CreateFolderDialog";
import { DeleteFolderDialog } from "../components/DeleteFolderDialog";
import { EmptyState } from "../components/EmptyState";
import { Header } from "../components/Header";
import { PlayerView } from "../components/PlayerView";
import { RenameFolderDialog } from "../components/RenameFolderDialog";
import { SearchBar } from "../components/SearchBar";
import { Sidebar } from "../components/Sidebar";
import { SortDropdown } from "../components/SortDropdown";
import { Toast } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { contentApi, folderApi } from "../services/api";
import type { FolderOption, FolderTreeNode, NavigationState, SavedContent, SortOption } from "../types/content";

const DEFAULT_NAVIGATION: NavigationState = {
  type: "HOME",
  label: "Home"
};

export function HomePage() {
  const [items, setItems] = useState<SavedContent[]>([]);
  const [folderTree, setFolderTree] = useState<FolderTreeNode[]>([]);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(new Set());
  const [navigation, setNavigation] = useState<NavigationState>(DEFAULT_NAVIGATION);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("PINNED_FIRST");
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [assigningContentId, setAssigningContentId] = useState<number | null>(null);
  const [activeContent, setActiveContent] = useState<SavedContent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedContent | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [createParentFolder, setCreateParentFolder] = useState<FolderTreeNode | null>(null);
  const [renameTarget, setRenameTarget] = useState<FolderTreeNode | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<FolderTreeNode | null>(null);
  const [submittingFolder, setSubmittingFolder] = useState(false);
  const [pageError, setPageError] = useState("");
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    void loadFolders();
  }, []);

  useEffect(() => {
    void loadItems();
  }, [navigation, search, sort]);

  async function loadFolders() {
    setLoadingFolders(true);

    try {
      const folderTreeResponse = await folderApi.getTree();
      setFolderTree(folderTreeResponse);
      setExpandedFolderIds(new Set(collectFolderIds(folderTreeResponse)));
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not load folders.", "error");
    } finally {
      setLoadingFolders(false);
    }
  }

  async function loadItems() {
    setLoadingItems(true);
    setPageError("");

    try {
      const response = await contentApi.getAll(resolveQueryParams(navigation, search, sort));
      setItems(response);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Could not load content.");
    } finally {
      setLoadingItems(false);
    }
  }

  async function handleAdd(url: string) {
    setSaving(true);

    try {
      await contentApi.add(url);
      await loadItems();
      showToast("Saved to Pinpoint.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save content.";
      if (message === "Already added.") {
        showToast(message, "info");
      }
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePin(content: SavedContent) {
    const previousItems = items;
    const optimisticItems = items.map((item) =>
      item.id === content.id ? { ...item, pinned: !item.pinned } : item
    );
    setItems(optimisticItems);

    try {
      const updatedItem = await contentApi.togglePin(content.id);
      setItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    } catch (error) {
      setItems(previousItems);
      showToast(error instanceof Error ? error.message : "Could not update pin state.", "error");
    }
  }

  async function handleAssignFolder(content: SavedContent, folderId: number | null) {
    setAssigningContentId(content.id);

    try {
      const updatedItem = await contentApi.assignFolder(content.id, folderId);
      setItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
      showToast(folderId ? "Content moved." : "Content unassigned.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not move content.", "error");
    } finally {
      setAssigningContentId(null);
    }
  }

  async function confirmDeleteContent() {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);

    try {
      await contentApi.remove(deleteTarget.id);
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      showToast("Item deleted.", "success");
      setDeleteTarget(null);

      if (activeContent?.id === deleteTarget.id) {
        setActiveContent(null);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete content.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function createFolder(name: string) {
    setSubmittingFolder(true);

    try {
      await folderApi.create(name, createParentFolder?.id ?? null);
      await loadFolders();
      setIsCreateFolderOpen(false);
      setCreateParentFolder(null);
      showToast("Folder created.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not create folder.", "error");
      throw error;
    } finally {
      setSubmittingFolder(false);
    }
  }

  async function renameFolder(name: string) {
    if (!renameTarget) {
      return;
    }

    setSubmittingFolder(true);

    try {
      await folderApi.rename(renameTarget.id, name);
      await Promise.all([loadFolders(), loadItems()]);
      if (navigation.type === "FOLDER" && navigation.folderId === renameTarget.id) {
        setNavigation({ type: "FOLDER", folderId: renameTarget.id, label: name });
      }
      setRenameTarget(null);
      showToast("Folder renamed.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not rename folder.", "error");
      throw error;
    } finally {
      setSubmittingFolder(false);
    }
  }

  async function deleteFolder() {
    if (!deleteFolderTarget) {
      return;
    }

    setSubmittingFolder(true);

    try {
      await folderApi.remove(deleteFolderTarget.id);
      if (navigation.type === "FOLDER" && navigation.folderId === deleteFolderTarget.id) {
        setNavigation(DEFAULT_NAVIGATION);
      }
      await Promise.all([loadFolders(), loadItems()]);
      setDeleteFolderTarget(null);
      showToast("Folder deleted.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete folder.", "error");
    } finally {
      setSubmittingFolder(false);
    }
  }

  const folderOptions = useMemo(() => buildFolderOptions(folderTree), [folderTree]);
  const currentViewDetails = useMemo(() => getViewDetails(navigation), [navigation]);
  const emptyStateCopy = useMemo(() => getEmptyStateCopy(navigation, loadingFolders), [navigation, loadingFolders]);
  const isSortLocked = navigation.type === "PINNED" || navigation.type === "RECENT";

  return (
    <main className="app-shell organizer-shell">
      <div className="organizer-layout">
        <Sidebar
          folderTree={folderTree}
          expandedFolderIds={expandedFolderIds}
          navigation={navigation}
          onNavigate={setNavigation}
          onToggleFolder={(folderId) =>
            setExpandedFolderIds((current) => {
              const next = new Set(current);
              if (next.has(folderId)) {
                next.delete(folderId);
              } else {
                next.add(folderId);
              }
              return next;
            })
          }
          onCreateRootFolder={() => {
            setCreateParentFolder(null);
            setIsCreateFolderOpen(true);
          }}
          onCreateSubfolder={(parentId) => {
            const folderNode = findFolderNode(folderTree, parentId);
            setCreateParentFolder(folderNode ?? null);
            setIsCreateFolderOpen(true);
          }}
          onRenameFolder={setRenameTarget}
          onDeleteFolder={setDeleteFolderTarget}
        />

        <div className="main-shell">
          <div className="app-content">
            <Header title={currentViewDetails.title} description={currentViewDetails.description} />
            <AddContentForm isSubmitting={saving} onSubmit={handleAdd} />

            <section className="surface control-panel">
              <SearchBar value={search} onChange={setSearch} />
              <SortDropdown value={resolveEffectiveSort(navigation, sort)} disabled={isSortLocked} onChange={setSort} />
            </section>

            {loadingItems ? <section className="surface status-panel">Loading your library...</section> : null}
            {!loadingItems && pageError ? (
              <section className="surface status-panel error-panel">{pageError}</section>
            ) : null}
            {!loadingItems && !pageError && items.length === 0 ? (
              <EmptyState title={emptyStateCopy.title} description={emptyStateCopy.description} />
            ) : null}

            {!loadingItems && !pageError && items.length > 0 ? (
              <ContentGrid
                items={items}
                folders={folderOptions}
                assigningContentId={assigningContentId}
                onOpen={setActiveContent}
                onTogglePin={handleTogglePin}
                onDelete={setDeleteTarget}
                onAssignFolder={handleAssignFolder}
              />
            ) : null}
          </div>
        </div>
      </div>

      {activeContent ? <PlayerView content={activeContent} onClose={() => setActiveContent(null)} /> : null}
      {deleteTarget ? (
        <ConfirmDeleteDialog
          content={deleteTarget}
          isDeleting={deletingId === deleteTarget.id}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteContent}
        />
      ) : null}
      {isCreateFolderOpen ? (
        <CreateFolderDialog
          parentName={createParentFolder?.name ?? null}
          isSubmitting={submittingFolder}
          onCancel={() => {
            setIsCreateFolderOpen(false);
            setCreateParentFolder(null);
          }}
          onCreate={createFolder}
        />
      ) : null}
      {renameTarget ? (
        <RenameFolderDialog
          folder={renameTarget}
          isSubmitting={submittingFolder}
          onCancel={() => setRenameTarget(null)}
          onRename={renameFolder}
        />
      ) : null}
      {deleteFolderTarget ? (
        <DeleteFolderDialog
          folder={deleteFolderTarget}
          isDeleting={submittingFolder}
          onCancel={() => setDeleteFolderTarget(null)}
          onDelete={deleteFolder}
        />
      ) : null}

      <Toast toast={toast} onClose={clearToast} />
    </main>
  );
}

function resolveQueryParams(navigation: NavigationState, search: string, sort: SortOption) {
  if (navigation.type === "PINNED") {
    return { pinned: true, search, sort: "PINNED_FIRST" as SortOption };
  }

  if (navigation.type === "RECENT") {
    return { search, sort: "NEWEST" as SortOption };
  }

  if (navigation.type === "FOLDER" && navigation.folderId) {
    return { folderId: navigation.folderId, search, sort };
  }

  return { search, sort };
}

function resolveEffectiveSort(navigation: NavigationState, selectedSort: SortOption) {
  if (navigation.type === "PINNED") {
    return "PINNED_FIRST";
  }

  if (navigation.type === "RECENT") {
    return "NEWEST";
  }

  return selectedSort;
}

function buildFolderOptions(nodes: FolderTreeNode[], depth = 0, trail: string[] = []): FolderOption[] {
  return nodes.flatMap((node) => {
    const label = [...trail, node.name].join(" / ");
    return [
      {
        id: node.id,
        name: node.name,
        label,
        depth
      },
      ...buildFolderOptions(node.children, depth + 1, [...trail, node.name])
    ];
  });
}

function collectFolderIds(nodes: FolderTreeNode[]): number[] {
  return nodes.flatMap((node) => [node.id, ...collectFolderIds(node.children)]);
}

function findFolderNode(nodes: FolderTreeNode[], id: number): FolderTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    const match = findFolderNode(node.children, id);
    if (match) {
      return match;
    }
  }

  return null;
}

function getViewDetails(navigation: NavigationState) {
  if (navigation.type === "PINNED") {
    return {
      title: "Pinned",
      description: "Your most important study material, kept at the top."
    };
  }

  if (navigation.type === "RECENT") {
    return {
      title: "Recent",
      description: "The latest videos and playlists you saved."
    };
  }

  if (navigation.type === "FOLDER") {
    return {
      title: navigation.label,
      description: "Content assigned to this topic folder."
    };
  }

  return {
    title: "Home",
    description: "All saved learning content across your library."
  };
}

function getEmptyStateCopy(navigation: NavigationState, loadingFolders: boolean) {
  if (navigation.type === "FOLDER") {
    return {
      title: "This folder is empty",
      description: "Move a video or playlist into this topic to keep your library organized."
    };
  }

  if (navigation.type === "PINNED") {
    return {
      title: "No pinned items yet",
      description: "Pin the resources you want quick access to from your main library."
    };
  }

  if (navigation.type === "RECENT") {
    return {
      title: "Nothing recent yet",
      description: "Add a YouTube video or playlist to start building your learning queue."
    };
  }

  return {
    title: loadingFolders ? "No saved content yet" : "Your library is empty",
    description: "Add a video or playlist above, then organize it into folders from the sidebar."
  };
}
