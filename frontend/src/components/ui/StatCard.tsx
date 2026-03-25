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
    <article className="rounded-shell bg-panel px-5 py-4 shadow-panel">
      <div className="flex items-start gap-3">
        <div className={`inline-flex size-[40px] items-center justify-center rounded-[12px] ${toneClass}`}>
          {icon}
        </div>
        <div className="grid gap-0.5">
          <span className="text-[13px] text-textMuted">{label}</span>
          <strong className="text-[19px] leading-[1.15] text-textStrong">{value}</strong>
        </div>
      </div>
      {progress !== undefined ? (
        <div className="mt-3 grid gap-2.5">
          <ProgressBar value={progress} tone="muted" />
          {helper ? <span className="text-[13px] text-textMuted">{helper}</span> : null}
        </div>
      ) : helper ? (
        <p className="mt-2.5 text-[13px] text-textMuted">{helper}</p>
      ) : null}
    </article>
  );
}
