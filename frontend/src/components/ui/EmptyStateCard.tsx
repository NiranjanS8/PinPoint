import type { ReactNode } from "react";

export function EmptyStateCard({
  icon,
  title,
  description,
  action
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-shell bg-panel shadow-panel">
      <div className="grid max-w-[420px] justify-items-center gap-2 text-center">
        <div className="mb-2 text-[var(--color-icon-muted)]">{icon}</div>
        <h2 className="m-0 text-[17px] font-medium text-textStrong">{title}</h2>
        <p className="m-0 text-[15px] leading-6 text-textMuted">{description}</p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
