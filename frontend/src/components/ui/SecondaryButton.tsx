import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function SecondaryButton({
  children,
  className = "",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-soft)] px-4 text-sm font-semibold text-textStrong transition duration-150 hover:-translate-y-[1px] hover:bg-mutedPanel active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
