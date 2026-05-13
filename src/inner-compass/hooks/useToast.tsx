import { useEffect, useState } from "react";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

const listeners = new Set<(toast: ToastMessage | null) => void>();

function emit(toast: ToastMessage | null) {
  listeners.forEach((listener) => listener(toast));
}

export function toast(message: Omit<ToastMessage, "id">) {
  const payload = { ...message, id: String(Date.now()) };
  emit(payload);
  window.setTimeout(() => emit(null), 3200);
}

export function useToast() {
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    listeners.add(setCurrentToast);
    return () => {
      listeners.delete(setCurrentToast);
    };
  }, []);

  return { toast: currentToast };
}
