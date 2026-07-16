"use client";

import { AuthProvider } from "@/lib/contexts/AuthContext";
import { LayoutProvider, useLayout } from "@/lib/contexts/LayoutContext";
import type { User } from "@/lib/types";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface ShellProps {
  /** Resolved server-side by `(app)/layout.tsx` before this ever renders. */
  user: User;
  children: React.ReactNode;
}

function ShellInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <MobileOverlay />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 sm:p-6" style={{ background: "var(--bg)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Dim + dismiss layer behind the mobile drawer (<lg only).
function MobileOverlay() {
  const { mobileOpen, closeMobile } = useLayout();
  if (!mobileOpen) return null;
  return (
    <button
      onClick={closeMobile}
      aria-label="Cerrar menú"
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
    />
  );
}

export default function Shell({ user, children }: ShellProps) {
  return (
    <AuthProvider initialUser={user}>
      <LayoutProvider>
        <ShellInner>{children}</ShellInner>
      </LayoutProvider>
    </AuthProvider>
  );
}
