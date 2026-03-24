import type { SortOption } from "../types/content";

const SORT_OPTIONS: Array<{ label: string; value: SortOption }> = [
  { label: "Pinned first", value: "PINNED_FIRST" },
  { label: "Newest first", value: "NEWEST" },
  { label: "Oldest first", value: "OLDEST" },
  { label: "Alphabetical", value: "ALPHABETICAL" }
];

interface SortDropdownProps {
  value: SortOption;
  disabled?: boolean;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, disabled = false, onChange }: SortDropdownProps) {
  return (
    <label className="sort-dropdown">
      <span className="sort-label">Sort</span>
      <select
        className="select-input"
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        disabled={disabled}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
