import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition hover:brightness-105 active:scale-[0.99] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
