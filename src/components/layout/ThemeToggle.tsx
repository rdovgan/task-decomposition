"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, Theme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light theme" },
  { value: "dark", icon: Moon, label: "Dark theme" },
  { value: "system", icon: Monitor, label: "Use system theme" },
];

// `collapsed` reflects the desktop rail state — the sidebar is always full
// width on mobile (an overlay), so the compact icon-only variant is hidden
// below the `md` breakpoint regardless of the collapsed preference.
export function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  const current = OPTIONS.find(o => o.value === theme) ?? OPTIONS[2];
  const next = OPTIONS[(OPTIONS.indexOf(current) + 1) % OPTIONS.length];

  return (
    <>
      <div
        className={cn("flex items-center gap-0.5 rounded-lg bg-sidebar-accent/40 p-0.5", collapsed && "md:hidden")}
        role="radiogroup"
        aria-label="Theme"
      >
        {OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            role="radio"
            aria-checked={theme === option.value}
            title={option.label}
            className={cn(
              "flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors",
              theme === option.value
                ? "bg-sidebar-accent text-white"
                : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
            )}
          >
            <option.icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      <button
        onClick={() => setTheme(next.value)}
        className={cn(
          "hidden w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
          collapsed && "md:flex"
        )}
        aria-label={`Theme: ${current.label}. Click to switch to ${next.label.toLowerCase()}`}
        title={current.label}
      >
        <current.icon className="h-4 w-4" />
      </button>
    </>
  );
}
