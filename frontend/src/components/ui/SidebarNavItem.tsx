import type { ReactNode } from "react";

export function SidebarNavItem({
  active,
  icon,
  label
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div
      className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-left text-[17px] text-textMuted transition duration-150 ${
        active ? "bg-[var(--color-surface-selected)] font-semibold text-textStrong" : "hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
