import type { ToastState } from "../hooks/useToast";
import { Button } from "./Button";

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
      <Button variant="ghost" size="sm" className="toast-close" onClick={onClose}>
        Dismiss
      </Button>
    </div>
  );
}
