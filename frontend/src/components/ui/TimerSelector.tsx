export function TimerSelector({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-2.5">
      {[15, 25, 45, 60].map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`min-h-10 min-w-[66px] rounded-[14px] px-[18px] text-[15px] font-semibold transition ${
            value === item
              ? "bg-navy text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
              : "bg-[var(--color-surface-soft)] text-textStrong hover:bg-mutedPanel"
          }`}
        >
          {item}m
        </button>
      ))}
    </div>
  );
}
