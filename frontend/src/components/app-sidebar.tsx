import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  HeartPulse,
  Stethoscope,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const patientItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Schedules", url: "/schedule", icon: CalendarDays },
  { title: "Doctors", url: "/doctors", icon: Users },
  { title: "Records", url: "/records", icon: FileText },
  { title: "Healthcare Appointment", url: "/healthcare-appointment", icon: Stethoscope },
  { title: "Health Library", url: "/health-library", icon: BookOpen },
];

const staffItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Schedule", url: "/schedule", icon: CalendarDays },
  { title: "Patient List", url: "/patients", icon: Users },
  { title: "Documents", url: "/records", icon: FileText },
  { title: "Health Services", url: "/healthcare-appointment", icon: Stethoscope },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const checkActive = (url: string) =>
    location === url || (url !== "/" && location.startsWith(url + "/"));

  const mainItems = user?.role === "staff" ? staffItems : patientItems;

  return (
    <aside className="flex flex-col h-screen w-60 shrink-0 bg-sidebar border-r border-sidebar-border shadow-sm z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-200 shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base leading-none tracking-tight text-sidebar-foreground">OPDMS</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Medical Center
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {mainItems.map((item) => {
          const active = checkActive(item.url);
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 w-full text-sm font-medium select-none",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                style={{ width: "1rem", height: "1rem", flexShrink: 0 }}
                className={active ? "text-white" : "text-muted-foreground"}
              />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 w-full text-sm font-medium select-none",
            checkActive("/settings")
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings
            style={{ width: "1rem", height: "1rem", flexShrink: 0 }}
            className={checkActive("/settings") ? "text-white" : "text-muted-foreground"}
          />
          <span>Settings</span>
        </Link>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-150 text-sm font-medium cursor-pointer select-none"
        >
          <LogOut
            style={{ width: "1rem", height: "1rem", flexShrink: 0 }}
            className="text-muted-foreground"
          />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
