import type { FolderOption } from "../types/content";

interface AssignFolderDropdownProps {
  value: number | null;
  folders: FolderOption[];
  disabled?: boolean;
  onChange: (folderId: number | null) => void;
}

export function AssignFolderDropdown({
  value,
  folders,
  disabled = false,
  onChange
}: AssignFolderDropdownProps) {
  return (
    <label className="assign-folder">
      <span className="sr-only">Assign folder</span>
      <select
        className="select-input"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue ? Number(nextValue) : null);
        }}
      >
        <option value="">Unassigned</option>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
            {folder.label}
          </option>
        ))}
      </select>
    </label>
  );
}
