import type { PropsWithChildren } from "react";

export function MetricCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-shell border border-borderSoft bg-panel shadow-panel ${className}`}>{children}</div>;
}
