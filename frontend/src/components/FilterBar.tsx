import type { FilterType } from "../types/content";

const FILTERS: Array<{ label: string; value: FilterType }> = [
  { label: "All", value: "ALL" },
  { label: "Videos", value: "VIDEO" },
  { label: "Playlists", value: "PLAYLIST" },
  { label: "Pinned", value: "PINNED" }
];

interface FilterBarProps {
  activeFilter: FilterType;
  onChange: (filter: FilterType) => void;
}

export function FilterBar({ activeFilter, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={`filter-chip ${activeFilter === filter.value ? "active" : ""}`}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
