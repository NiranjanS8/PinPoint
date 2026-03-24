export function TimerSelector({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {[15, 25, 45, 60].map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`min-h-10 min-w-[66px] rounded-[14px] px-[18px] text-[15px] font-semibold outline-none ring-0 transition duration-150 active:scale-[0.985] focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
            value === item
              ? "bg-accentBlue text-white"
              : "bg-[var(--color-surface-soft)] text-textStrong hover:-translate-y-[1px] hover:bg-mutedPanel"
          }`}
        >
          {item}m
        </button>
      ))}
    </div>
  );
}
