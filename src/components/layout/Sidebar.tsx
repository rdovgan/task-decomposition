"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Layers,
  CheckSquare,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/epics", label: "Epics", icon: Layers },
  { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  }, []);

  if (!mounted) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex h-14 items-center border-b px-4",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="truncate text-sm font-bold tracking-tight">Task Decomposer</h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map(item => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t p-2">
        <button
          onClick={toggleCollapsed}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
