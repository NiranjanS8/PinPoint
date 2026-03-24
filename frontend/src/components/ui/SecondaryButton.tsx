import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function SecondaryButton({
  children,
  className = "",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-borderSoft bg-panel px-4 text-sm font-semibold text-textStrong shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition hover:bg-mutedPanel ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
