import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";

export function FolderDialog({
  title,
  description,
  initialName = "",
  open,
  onClose,
  onSubmit
}: {
  title: string;
  description: string;
  initialName?: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(initialName);
    setError(null);
    setSubmitting(false);
  }, [initialName, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setError("Please enter a folder name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(trimmedName);
      onClose();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Failed to save folder.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-[rgba(16,24,40,0.22)] p-6"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="w-full max-w-[420px] rounded-[20px] bg-panel p-6 shadow-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-[22px] font-semibold text-textStrong">{title}</h2>
            <p className="mt-1.5 text-[15px] text-textMuted">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-textMuted transition hover:bg-mutedPanel"
            disabled={submitting}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-textStrong">Folder Name</span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder="Spring Boot"
              className="min-h-[46px] rounded-[14px] bg-mutedPanel px-4 text-sm text-textStrong outline-none ring-1 ring-inset ring-borderSoft focus:ring-white/10"
              disabled={submitting}
              autoFocus
              spellCheck={false}
            />
          </label>

          {error ? <p className="m-0 text-sm text-[#b42318]">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={onClose} disabled={submitting}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? "Saving..." : "Save Folder"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
