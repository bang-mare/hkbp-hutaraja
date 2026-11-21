import React, { useEffect } from 'react';

export interface ToastState {
  id: number;
  message: string;
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const duration = toast.onUndo ? 5000 : 2200;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="mare-toast" role="status" aria-live="polite">
      <span>{toast.message}</span>
      {toast.onUndo && (
        <button
          type="button"
          className="mare-toast-undo"
          onClick={() => {
            toast.onUndo?.();
            onDismiss();
          }}
        >
          Urungkan
        </button>
      )}
    </div>
  );
};
