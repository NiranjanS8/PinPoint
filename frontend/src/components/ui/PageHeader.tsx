export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="grid gap-2">
      <h1 className="m-0 text-[38px] font-bold leading-[1.08] tracking-[-0.04em] text-textStrong">
        {title}
      </h1>
      {subtitle ? <p className="m-0 text-[17px] text-textMuted">{subtitle}</p> : null}
    </header>
  );
}
