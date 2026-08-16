"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}

const iconMap = {
  success: <CheckCircle className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

const colorMap = {
  success: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  error: "border-destructive/50 bg-destructive/10 text-destructive",
  info: "border-blue-500/50 bg-blue-500/10 text-blue-400",
};

function ToastItem({ toast, dismiss }: { toast: ToastItem; dismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-lg transition-all duration-300 ${colorMap[toast.type]} ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      role="alert"
    >
      {iconMap[toast.type]}
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => dismiss(toast.id)}
        className="p-0.5 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, dismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} dismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
