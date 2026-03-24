import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderDialog } from "../components/sidebar/FolderDialog";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useContent } from "../context/ContentContext";
import { useToast } from "../context/ToastContext";
import type { FolderItem } from "../types/workspace";

export function FoldersPage() {
  const navigate = useNavigate();
  const { folders, videos, createFolder, removeFolder } = useContent();
  const { showToast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const folderCards = useMemo(() => {
    return [...folders]
      .map((folder) => ({
        folder,
        contentCount: videos.filter((video) => video.folderId === folder.id).length,
        parentName: folder.parentId ? folders.find((candidate) => candidate.id === folder.parentId)?.name ?? null : null
      }))
      .sort((left, right) => left.folder.name.localeCompare(right.folder.name));
  }, [folders, videos]);

  async function handleCreateFolder(name: string) {
    await createFolder(name, null);
    showToast({
      tone: "success",
      title: "Folder created",
      description: name
    });
  }

  async function handleDeleteFolder(folder: FolderItem) {
    const confirmed = window.confirm(
      `Delete "${folder.name}" and all nested folders? Content inside them will become unassigned.`
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
    } catch (exception) {
      showToast({
        tone: "error",
        title: "Unable to delete folder",
        description: exception instanceof Error ? exception.message : "Please try again."
      });
    }
  }

  return (
    <div>
      <div className="mb-7 flex items-start justify-between gap-6">
        <PageHeader title="Folders" subtitle="" />
        <PrimaryButton onClick={() => setShowCreateDialog(true)}>
          <Plus className="size-4" />
          New Folder
        </PrimaryButton>
      </div>

      {folderCards.length === 0 ? (
        <EmptyStateCard
          icon={<FolderOpen className="size-[54px]" strokeWidth={1.8} />}
          title="No folders yet"
          description="Create a folder to start grouping videos by topic, stack, or study track."
          action={
            <PrimaryButton onClick={() => setShowCreateDialog(true)}>
              <Plus className="size-4" />
              Create Folder
            </PrimaryButton>
          }
        />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {folderCards.map(({ folder, contentCount, parentName }) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => navigate(`/?folderId=${folder.id}`)}
              className="group overflow-hidden rounded-shell bg-panel text-left shadow-panel transition duration-150 hover:-translate-y-[2px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
            >
              <div className="flex aspect-[2.35/1] items-center justify-center bg-accentBlue text-white">
                <FolderOpen className="size-12" strokeWidth={1.8} />
              </div>
              <div className="grid gap-4 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-[19px] font-semibold text-textStrong">{folder.name}</h3>
                    {parentName ? (
                      <p className="mt-1 text-[14px] text-textMuted">Inside {parentName}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDeleteFolder(folder);
                    }}
                    className="inline-flex size-9 items-center justify-center rounded-xl text-[#f97066] transition hover:bg-[rgba(249,112,102,0.12)]"
                    aria-label={`Delete ${folder.name}`}
                    title="Delete folder"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="text-[15px] text-textMuted">
                  {contentCount} {contentCount === 1 ? "item" : "items"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <FolderDialog
        open={showCreateDialog}
        title="Create Folder"
        description="Add a top-level folder to organize your learning content."
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}
