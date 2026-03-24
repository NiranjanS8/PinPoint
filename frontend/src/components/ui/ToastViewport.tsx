import { CheckCircle2, Info, X, AlertCircle } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const toneStyles = {
  success: {
    icon: <CheckCircle2 className="size-4" />,
    className: "text-emerald-300"
  },
  error: {
    icon: <AlertCircle className="size-4" />,
    className: "text-rose-300"
  },
  info: {
    icon: <Info className="size-4" />,
    className: "text-sky-300"
  }
} as const;

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-50 grid w-[360px] gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-2xl bg-panel px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.26)] ring-1 ring-white/6 animate-[toast-in_180ms_ease-out]"
        >
          <div className={`mt-0.5 ${toneStyles[toast.tone].className}`}>{toneStyles[toast.tone].icon}</div>
          <div className="min-w-0">
            <p className="m-0 text-[14px] font-semibold text-textStrong">{toast.title}</p>
            {toast.description ? (
              <p className="mt-1 text-[13px] leading-5 text-textMuted">{toast.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="inline-flex size-7 items-center justify-center rounded-lg text-textMuted transition hover:bg-[var(--color-surface-soft)] hover:text-textStrong"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
