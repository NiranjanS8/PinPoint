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
    <div className="grid min-h-[320px] place-items-center rounded-shell border border-borderSoft bg-panel shadow-panel">
      <div className="grid justify-items-center gap-2 text-center">
        <div className="mb-2 text-[var(--color-icon-muted)]">{icon}</div>
        <h2 className="m-0 text-[17px] font-medium text-textStrong">{title}</h2>
        <p className="m-0 text-[16px] text-textMuted">{description}</p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
