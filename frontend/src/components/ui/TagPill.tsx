import type { ButtonHTMLAttributes } from "react";

export function TagPill({
  selected,
  staticStyle,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; staticStyle?: boolean }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-[30px] items-center justify-center rounded-full px-3.5 text-sm ${
        staticStyle
          ? "bg-[var(--color-surface-muted)] text-textMuted"
          : selected
            ? "border border-borderSoft bg-[var(--color-surface-selected)] text-textStrong"
            : "border border-borderSoft bg-panel text-textStrong"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
