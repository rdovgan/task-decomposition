"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(240);

  useEffect(() => {
    const checkCollapsed = () => {
      const stored = localStorage.getItem("sidebar-collapsed");
      setSidebarWidth(stored === "true" ? 64 : 240);
    };
    checkCollapsed();

    // Listen for storage changes (from sidebar toggle)
    const interval = setInterval(checkCollapsed, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className="flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </div>
    </div>
  );
}
