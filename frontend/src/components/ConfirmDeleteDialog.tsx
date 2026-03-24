import type { SavedContent } from "../types/content";

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
          <button type="button" className="ghost-button" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
