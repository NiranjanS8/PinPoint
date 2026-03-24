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
          className={`min-h-10 min-w-[66px] rounded-[14px] border px-[18px] text-[15px] font-semibold ${
            value === item
              ? "border-navy bg-navy text-white"
              : "border-borderSoft bg-panel text-textStrong"
          }`}
        >
          {item}m
        </button>
      ))}
    </div>
  );
}
