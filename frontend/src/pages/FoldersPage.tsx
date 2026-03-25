import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderDialog } from "../components/sidebar/FolderDialog";
import { EmptyStateCard } from "../components/ui/EmptyStateCard";
import { PageHeader } from "../components/ui/PageHeader";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { useContent } from "../context/ContentContext";
import { useToast } from "../context/ToastContext";
import type { FolderItem } from "../types/workspace";

export function FoldersPage() {
  const navigate = useNavigate();
  const { folders, videos, createFolder, removeFolder } = useContent();
  const { showToast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [folderPendingDelete, setFolderPendingDelete] = useState<FolderItem | null>(null);

  const folderCards = useMemo(() => {
    return [...folders]
      .map((folder) => ({
        folder,
        contentCount: videos.filter((video) => video.folderId === folder.id).length,
        parentName: folder.parentId ? folders.find((candidate) => candidate.id === folder.parentId)?.name ?? null : null
      }))
      .sort((left, right) => left.folder.name.localeCompare(right.folder.name));
  }, [folders, videos]);

  async function handleCreateFolder(name: string, description: string) {
    await createFolder(name, null, description);
    showToast({
      tone: "success",
      title: "Folder created",
      description: name
    });
  }

  async function handleDeleteFolder(folder: FolderItem) {
    try {
      await removeFolder(Number(folder.id));
      setFolderPendingDelete(null);
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
        <PageHeader title="Library" subtitle="" />
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
        <div className="grid grid-cols-3 gap-4 2xl:grid-cols-4">
          {folderCards.map(({ folder, contentCount, parentName }) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => navigate(`/folders/${folder.id}`)}
              className="group overflow-hidden rounded-shell bg-panel text-left shadow-panel transition duration-150 hover:-translate-y-[2px] hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
            >
              <div className="flex aspect-[2.7/1] items-center justify-center bg-accentBlue text-white">
                <FolderOpen className="size-10" strokeWidth={1.8} />
              </div>
              <div className="grid gap-3 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-[17px] font-semibold text-textStrong">{folder.name}</h3>
                    {parentName ? (
                      <p className="mt-1 text-[13px] text-textMuted">Inside {parentName}</p>
                    ) : null}
                    {folder.description ? (
                      <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-textMuted">
                        {folder.description}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFolderPendingDelete(folder);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-xl text-[#f97066] transition hover:bg-[rgba(249,112,102,0.12)]"
                    aria-label={`Delete ${folder.name}`}
                    title="Delete folder"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="text-[14px] text-textMuted">
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
        description=""
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateFolder}
      />

      {folderPendingDelete ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-[rgba(8,10,14,0.62)] p-6">
          <div className="w-full max-w-[460px] rounded-[22px] bg-panel p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/5">
            <div className="grid gap-3">
              <div>
                <h3 className="text-[24px] font-semibold text-textStrong">Delete Folder</h3>
                <p className="mt-2 text-[15px] leading-6 text-textMuted">
                  Delete "{folderPendingDelete.name}" and all nested folders? Content inside them will become
                  unassigned.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <SecondaryButton onClick={() => setFolderPendingDelete(null)}>Cancel</SecondaryButton>
                <button
                  type="button"
                  onClick={() => void handleDeleteFolder(folderPendingDelete)}
                  className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-[#6b2428] px-4 text-sm font-semibold text-white transition duration-150 hover:bg-[#7f2b30] active:scale-[0.985]"
                >
                  Delete Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
