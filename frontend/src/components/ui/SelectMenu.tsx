import { ChevronDown, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface SelectOption {
  value: string;
  label: string;
}

export function SelectMenu({
  value,
  options,
  onChange,
  disabled,
  className = ""
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0] ?? null,
    [options, value]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[14px] bg-[var(--color-surface-muted)] px-4 text-[15px] text-textStrong outline-none transition hover:bg-mutedPanel disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="truncate">{selectedOption?.label ?? "Select"}</span>
        <ChevronDown className={`size-4 text-textMuted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-[16px] bg-panel p-1.5 shadow-[0_18px_42px_rgba(0,0,0,0.32)] ring-1 ring-white/6">
          <div className="grid gap-1">
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex min-h-10 items-center justify-between gap-3 rounded-[12px] px-3 text-left text-[14px] transition ${
                    selected
                      ? "bg-[var(--color-surface-selected)] text-textStrong"
                      : "text-textMuted hover:bg-[var(--color-surface-soft)] hover:text-textStrong"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {selected ? <Check className="size-4 text-accentBlue" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
