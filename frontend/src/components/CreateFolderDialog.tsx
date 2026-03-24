import { type FormEvent, useState } from "react";
import { Button } from "./Button";

interface CreateFolderDialogProps {
  parentName?: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function CreateFolderDialog({
  parentName,
  isSubmitting,
  onCancel,
  onCreate
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Folder name is required.");
      return;
    }

    setError("");
    await onCreate(name.trim());
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel folder-dialog">
        <div className="section-copy">
          <h2>{parentName ? "Add subfolder" : "Create folder"}</h2>
          <p>{parentName ? `Inside ${parentName}` : "Create a new top-level topic."}</p>
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
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
