"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({ open, onClose, title, children, footer, size = "md" }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => setAnimating(true));
    } else {
      setAnimating(false);
      // Wait for animation to finish before hiding
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!visible) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
        animating ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          "relative w-full bg-background rounded-xl shadow-2xl transition-all duration-200",
          sizeClasses[size],
          animating ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2"
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 id="dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 border-t px-6 py-4 bg-muted/30 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
