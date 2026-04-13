"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FolderOpen,
  User,
} from "lucide-react";
import { cn } from "@workstream/ui/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/programs", label: "Programs", icon: BookOpen, exact: false },
  { href: "/dashboard/applications", label: "Applications", icon: FileText, exact: false },
  { href: "/dashboard/documents", label: "Documents", icon: FolderOpen, exact: false },
  { href: "/dashboard/profile", label: "Profile", icon: User, exact: false },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-background flex flex-col z-40">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <span className="font-display text-lg font-bold text-accent-foreground">W</span>
        </div>
        <span className="font-display text-xl font-bold tracking-tight">Workstream</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User button at bottom */}
      <div className="shrink-0 border-t border-border px-4 py-4 flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
        <span className="text-sm text-muted-foreground">Account</span>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Main content offset by sidebar width */}
      <div className="flex-1 ml-64 min-h-screen bg-background">
        {children}
      </div>
    </div>
  );
}
