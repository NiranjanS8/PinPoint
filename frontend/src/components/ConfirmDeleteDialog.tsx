import type { SavedContent } from "../types/content";
import { Button } from "./Button";

interface ConfirmDeleteDialogProps {
  content: SavedContent;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({
  content,
  isDeleting,
  onCancel,
  onConfirm
}: ConfirmDeleteDialogProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel confirm-panel">
        <h2>Delete this item?</h2>
        <p>
          <strong>{content.title}</strong> will be removed from your saved list.
        </p>
        <div className="modal-footer">
          <Button variant="ghost" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
