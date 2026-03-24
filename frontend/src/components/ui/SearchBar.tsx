import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search videos..."
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-[14px] bg-mutedPanel px-4 text-textMuted">
      <Search className="size-[18px]" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-[17px] text-textStrong outline-none"
      />
    </label>
  );
}
