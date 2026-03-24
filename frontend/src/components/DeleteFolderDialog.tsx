import type { FolderTreeNode } from "../types/content";
import { Button } from "./Button";

interface DeleteFolderDialogProps {
  folder: FolderTreeNode;
  isDeleting: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

export function DeleteFolderDialog({
  folder,
  isDeleting,
  onCancel,
  onDelete
}: DeleteFolderDialogProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel confirm-panel">
        <h2>Delete folder?</h2>
        <p>
          <strong>{folder.name}</strong> and its subfolders will be removed. Any assigned content will stay in
          Pinpoint and become unassigned.
        </p>
        <div className="modal-footer">
          <Button variant="ghost" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
