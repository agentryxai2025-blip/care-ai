import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Briefcase, FileText, Cpu, Calendar,
  CreditCard, ShieldCheck, BarChart3, Network, Database, Settings,
  ChevronLeft, ChevronRight, Bell, Sun, Moon, Waves, LogOut, User
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { CareAffinityIcon } from "@/components/CareAffinityIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/requests", label: "Requests", icon: FileText, badge: "8" },
      { href: "/matching", label: "CareAffinity", icon: CareAffinityIcon },
      { href: "/bookings", label: "Bookings", icon: Calendar },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/participants", label: "Participants", icon: Users },
      { href: "/providers", label: "Providers", icon: Briefcase },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/claims", label: "Claims", icon: CreditCard, badge: "3" },
    ],
  },
  {
    label: "Compliance",
    items: [
      { href: "/compliance", label: "Compliance", icon: ShieldCheck, badge: "2", badgeVariant: "destructive" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/architecture", label: "Architecture", icon: Network },
      { href: "/data-sources", label: "Data Sources", icon: Database },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-14 px-4 border-b border-sidebar-border gap-3", collapsed && "justify-center px-2")}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary flex-shrink-0">
            <Cpu className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-sidebar-foreground tracking-tight">Agentryx</div>
              <div className="text-xs text-sidebar-foreground/50">Care Platform</div>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 px-2 mb-1">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                        collapsed && "justify-center px-2",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant={item.badgeVariant || "secondary"}
                              className="text-[10px] h-4 px-1.5 min-w-[16px] flex items-center justify-center"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            data-testid="sidebar-collapse-toggle"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Harbour Care Services</span>
            <span className="text-muted-foreground/50">·</span>
            <span>Operations Console</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <div className="flex items-center gap-0.5 border border-border rounded-md p-0.5" data-testid="theme-switcher">
              <button
                data-testid="theme-light"
                onClick={() => setTheme("light")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  theme === "light" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                title="Light theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                data-testid="theme-dark"
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  theme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                title="Dark theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                data-testid="theme-ocean"
                onClick={() => setTheme("ocean")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  theme === "ocean" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                title="Ocean theme"
              >
                <Waves className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notification bell */}
            <Button variant="ghost" size="icon" className="relative" data-testid="notification-bell">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
            </Button>

            {/* Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="user-avatar" className="flex items-center gap-2 rounded-full focus:outline-none">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">JT</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="font-medium">Jamie Torres</div>
                  <div className="text-xs text-muted-foreground font-normal">Operations Manager</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-3.5 h-3.5 mr-2" />Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-3.5 h-3.5 mr-2" />Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="w-3.5 h-3.5 mr-2" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
