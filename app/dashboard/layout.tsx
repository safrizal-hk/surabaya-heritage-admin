"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useDB } from "@/lib/context";
import {
  LayoutDashboard,
  Landmark,
  Tags,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  Bell,
  Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  subItems?: { name: string; href: string }[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthenticated, logout } = useDB();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isMounted || !isAuthenticated || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
          <p className="text-sm text-zinc-500 font-medium animate-pulse">Checking credentials...</p>
        </div>
      </div>
    );
  }

  const navigation: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Places", href: "/dashboard/places", icon: Landmark },
    { name: "Categories", href: "/dashboard/categories", icon: Tags },
    { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
    { name: "Users", href: "/dashboard/users", icon: Users },
  ];

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Helper to determine if link is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join("/")}`;
      const isLast = index === paths.length - 1;
      const formattedName = path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
      return { name: formattedName, href, isLast };
    });
  };

  return (
    <div className="w-full max-w-full flex h-screen overflow-hidden bg-zinc-50/50 font-sans text-zinc-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#1B3A6B", borderColor: "rgba(245, 230, 200, 0.2)" }}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b" style={{ borderColor: "rgba(245, 230, 200, 0.2)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg ..." style={{ backgroundColor: "#F5E6C8" }}>
            <Landmark className="h-4.5 w-4.5" style={{ color: "#1B3A6B" }} />
            </div>
            <span className="font-bold tracking-tight" style={{ color: "#F5E6C8" }}>Surabaya Heritage</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-zinc-500 hover:text-zinc-950 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <div key={item.name} className="space-y-1">
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  style={active
                    ? { backgroundColor: "rgba(245, 230, 200, 0.2)", color: "#F5E6C8", fontWeight: 600 }
                    : { color: "rgba(245, 230, 200, 0.7)" }
                  }
                >
                  <item.icon
                    className="h-4.5 w-4.5 shrink-0"
                    style={active ? { color: "#F5E6C8" } : { color: "rgba(245, 230, 200, 0.5)" }}
                  />
                  <span>{item.name}</span>
                </Link>

                {/* Sub items */}
                {item.subItems && active && (
                  <div className="pl-9 space-y-1">
                    {item.subItems.map((sub) => {
                      const subActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`block rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            subActive
                              ? "text-zinc-950 font-semibold"
                              : "text-zinc-500 hover:text-zinc-950"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t p-4" style={{ borderColor: "rgba(245, 230, 200, 0.2)" }}>
          <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
            <Avatar className="h-9 w-9 border" style={{ borderColor: "rgba(245, 230, 200, 0.3)" }}>
              <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
              <AvatarFallback 
                className="text-[10px] font-bold"
                style={{ backgroundColor: "#F5E6C8", color: "#1B3A6B" }}
              >
                {getInitials(currentUser.name)}
            </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate" style={{ color: "#F5E6C8" }}>{currentUser.name}</p>
              <p className="text-[10px] truncate" style={{ color: "rgba(245, 230, 200, 0.6)" }}>{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:opacity-80"
            style={{ color: "#F87171" }}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" style={{ color: "#F87171" }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 shadow-2xs" style={{ borderColor: "#E8D0A0" }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-2.5 text-xs font-medium text-zinc-500">
              <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">
                Dashboard
              </Link>
              {getBreadcrumbs().map((bc) => {
                if (bc.name === "Dashboard") return null;
                return (
                  <React.Fragment key={bc.href}>
                    <span className="text-zinc-300">/</span>
                    <Link
                      href={bc.href}
                      className={
                        bc.isLast
                          ? "text-zinc-950 font-semibold pointer-events-none"
                          : "hover:text-zinc-950 transition-colors"
                      }
                    >
                      {bc.name}
                    </Link>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-4">

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 focus:outline-hidden hover:bg-zinc-50 rounded-lg p-1.5 transition-colors cursor-pointer"
              >
                <Avatar className="h-7.5 w-7.5 border border-zinc-200">
                  <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
                  <AvatarFallback className="text-[10px] font-bold">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border border-zinc-200 bg-white p-1 shadow-md z-20">
                    <Link
                      href={`/dashboard/users/${currentUser.id}/edit`}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                    >
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>Edit Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
