"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++toastCounter}`;
      const duration = toast.duration ?? 5000;
      setToasts(prev => [...prev, { ...toast, id }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

const toastConfig: Record<
  ToastType,
  { icon: React.ElementType; className: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    className: "border-green-500/30 bg-green-50 dark:bg-green-950/50",
    iconClass: "text-green-600 dark:text-green-400",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-500/30 bg-red-50 dark:bg-red-950/50",
    iconClass: "text-red-600 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/50",
    iconClass: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    icon: Info,
    className: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/50",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
};

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map(toast => {
        const config = toastConfig[toast.type];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={cn(
              "rounded-lg border p-4 shadow-lg transition-all",
              config.className
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconClass)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
