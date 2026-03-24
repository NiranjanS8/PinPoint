import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search videos...",
  className = ""
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={`flex min-h-11 items-center gap-3 rounded-[13px] bg-mutedPanel px-3.5 text-textMuted ring-1 ring-transparent transition focus-within:ring-white/10 hover:bg-[var(--color-surface-soft)] ${className}`}
    >
      <Search className="size-[17px]" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-[16px] text-textStrong outline-none placeholder:text-textMuted"
      />
    </label>
  );
}
