import type { ToastState } from "../hooks/useToast";

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <div className={`toast toast-${toast.variant}`}>
      <span>{toast.message}</span>
      <button type="button" className="ghost-button toast-close" onClick={onClose}>
        Dismiss
      </button>
    </div>
  );
}
