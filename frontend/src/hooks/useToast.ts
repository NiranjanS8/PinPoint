import { useCallback, useEffect, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

export interface ToastState {
  message: string;
  variant: ToastVariant;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ message, variant });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return useMemo(
    () => ({
      toast,
      showToast,
      clearToast
    }),
    [toast, showToast, clearToast]
  );
}
