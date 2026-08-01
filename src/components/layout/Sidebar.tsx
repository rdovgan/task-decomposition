"use client";

import React from "react";
import {
  FolderKanban,
  Layers,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  X,
  LogIn,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navItems = [
  { href: "/", label: "Decompose", icon: Sparkles },
  { href: "/team", label: "Team", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/epics", label: "Epics", icon: Layers },
  { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mounted, mobileOpen, setMobileOpen } = useSidebar();
  const { user, loading: authLoading, logout } = useAuth();

  if (!mounted) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground transition-transform duration-300 ease-in-out md:transition-[width]",
        collapsed ? "md:w-16" : "md:w-60",
        mobileOpen ? "translate-x-0" : "-translate-x-[110%] md:translate-x-0"
      )}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex h-16 items-center px-4",
          collapsed ? "justify-between md:justify-center" : "justify-between"
        )}
      >
        <div className={cn("flex items-center", collapsed ? "md:gap-0 gap-3" : "gap-3")}>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-glow"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className={cn("overflow-hidden", collapsed && "md:hidden")}>
            <h1 className="truncate text-sm font-bold tracking-tight text-white">Task Decomposer</h1>
            <p className="truncate text-[11px] text-sidebar-foreground/50">AI-powered planning</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground md:hidden"
          aria-label="Close navigation menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-4 mb-2 h-px bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-2">
        {navItems.map(item => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                collapsed && "md:justify-center md:px-2",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-4.5 w-[3px] -translate-y-1/2 rounded-full"
                  style={{ backgroundImage: "var(--gradient-brand)" }}
                />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/80"
                )}
              />
              <span className={cn("truncate", collapsed && "md:hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Auth + Theme + Collapse */}
      <div className="space-y-2 border-t border-sidebar-border p-2.5">
        {!authLoading &&
          (user ? (
            <button
              onClick={logout}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                collapsed && "md:justify-center md:px-2"
              )}
              title={collapsed ? `Log out (${user.name})` : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0 text-sidebar-foreground/45" />
              <span className={cn("truncate", collapsed && "md:hidden")}>{user.name}</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                collapsed && "md:justify-center md:px-2"
              )}
              title={collapsed ? "Sign In" : undefined}
            >
              <LogIn className="h-4 w-4 shrink-0 text-sidebar-foreground/45" />
              <span className={cn("truncate", collapsed && "md:hidden")}>Sign In</span>
            </Link>
          ))}
        <ThemeToggle collapsed={collapsed} />
        <button
          onClick={toggleCollapsed}
          className={cn(
            "hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground md:flex",
            collapsed && "md:justify-center md:px-2"
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
