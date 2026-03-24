import type { ReactNode } from "react";
import { ProgressBar } from "./ProgressBar";

export function StatCard({
  icon,
  toneClass,
  label,
  value,
  helper,
  progress
}: {
  icon: ReactNode;
  toneClass: string;
  label: string;
  value: string;
  helper?: string;
  progress?: number;
}) {
  return (
    <article className="rounded-shell bg-panel px-7 py-6 shadow-panel">
      <div className="flex items-start gap-4">
        <div className={`inline-flex size-[46px] items-center justify-center rounded-[14px] ${toneClass}`}>
          {icon}
        </div>
        <div className="grid gap-1">
          <span className="text-sm text-textMuted">{label}</span>
          <strong className="text-[21px] leading-[1.15] text-textStrong">{value}</strong>
        </div>
      </div>
      {progress !== undefined ? (
        <div className="mt-4 grid gap-3">
          <ProgressBar value={progress} tone="muted" />
          {helper ? <span className="text-sm text-textMuted">{helper}</span> : null}
        </div>
      ) : helper ? (
        <p className="mt-3 text-sm text-textMuted">{helper}</p>
      ) : null}
    </article>
  );
}
