import { ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Bell, UserCircle, Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { useNotifications } from "@/hooks/use-notifications";

export function Layout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = `${user.firstName?.[0] || user.name?.[0] || ""}${
    user.lastName?.[0] || user.name?.split(" ")[1]?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full animate-in slide-in-from-left duration-200">
            <AppSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b bg-card/80 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-sm sm:text-base font-display font-semibold text-foreground truncate">
              Welcome to Don Juan Medical Center
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative text-muted-foreground hover:text-primary transition-colors rounded-full p-2">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* User Info */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {user.role === "staff" ? (user.occupation || "Medical Staff") : user.role}
                </p>
              </div>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border-2 border-primary/20 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{initials}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
