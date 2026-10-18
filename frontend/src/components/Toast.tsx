import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-olive-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-taupe-600 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-white border-olive-200 text-charcoal-900',
    error: 'bg-white border-rose-200 text-charcoal-900',
    info: 'bg-white border-taupe-200 text-charcoal-900',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-elevated transition-all transform translate-y-0 ${bgStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium leading-relaxed flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-charcoal-400 hover:text-charcoal-700 transition-colors p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
