import { type FormEvent, useState } from "react";
import type { FolderTreeNode } from "../types/content";
import { Button } from "./Button";

interface RenameFolderDialogProps {
  folder: FolderTreeNode;
  isSubmitting: boolean;
  onCancel: () => void;
  onRename: (name: string) => Promise<void>;
}

export function RenameFolderDialog({
  folder,
  isSubmitting,
  onCancel,
  onRename
}: RenameFolderDialogProps) {
  const [name, setName] = useState(folder.name);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Folder name is required.");
      return;
    }

    setError("");
    await onRename(name.trim());
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel folder-dialog">
        <div className="section-copy">
          <h2>Rename folder</h2>
          <p>Update the label shown in the sidebar.</p>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <input
            className="text-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Folder name"
            autoFocus
          />
          {error ? <p className="form-error">{error}</p> : null}
          <div className="modal-footer">
            <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
