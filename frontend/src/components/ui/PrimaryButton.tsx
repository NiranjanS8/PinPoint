import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white transition hover:opacity-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
