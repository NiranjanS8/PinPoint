export function ProgressBar({
  value,
  tone = "blue",
  compact = false
}: {
  value: number;
  tone?: "blue" | "neutral" | "muted" | "dark";
  compact?: boolean;
}) {
  const fillClass =
    tone === "blue"
      ? "bg-accentBlue"
      : tone === "neutral"
        ? "bg-[var(--color-progress-neutral)]"
        : tone === "dark"
          ? "bg-[var(--color-progress-dark)]"
          : "bg-[var(--color-progress-muted)]";

  return (
    <div className={`overflow-hidden rounded-full bg-[var(--color-progress-track)] ${compact ? "h-2" : "h-2.5"}`}>
      <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${value}%` }} />
    </div>
  );
}
