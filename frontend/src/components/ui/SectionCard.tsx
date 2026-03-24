import type { PropsWithChildren, ReactNode } from "react";

export function SectionCard({
  title,
  actions,
  children,
  className = ""
}: PropsWithChildren<{ title?: string; actions?: ReactNode; className?: string }>) {
  return (
    <section className={`rounded-shell border border-borderSoft bg-panel shadow-panel ${className}`}>
      {title || actions ? (
        <div className="flex items-center justify-between gap-4 px-7 pt-7">
          {title ? <h2 className="m-0 text-[17px] font-semibold text-textStrong">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      <div className={title || actions ? "px-7 pb-7 pt-6" : ""}>{children}</div>
    </section>
  );
}
