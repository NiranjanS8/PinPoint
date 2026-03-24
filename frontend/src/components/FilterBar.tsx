import { Button } from "./Button";
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
    <section className="filter-section">
      <div className="section-heading compact-heading">
        <div className="section-copy">
          <h2>Library</h2>
        </div>
      </div>

      <div className="filter-bar">
      {FILTERS.map((filter) => (
        <Button
          key={filter.value}
          size="sm"
          className={`filter-chip ${activeFilter === filter.value ? "active" : ""}`}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
      </div>
    </section>
  );
}
