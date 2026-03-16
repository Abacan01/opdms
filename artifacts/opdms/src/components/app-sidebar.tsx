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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Schedules", url: "/schedule", icon: CalendarDays },
  { title: "Doctors", url: "/doctors", icon: Users },
  { title: "Records", url: "/records", icon: FileText },
  { title: "Healthcare Appointment", url: "/healthcare-appointment", icon: Stethoscope },
  { title: "Health Library", url: "/health-library", icon: BookOpen },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3 px-1 group cursor-pointer">
          <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300 shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-lg leading-none tracking-tight">OPDMS</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Medical Center</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainItems.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full",
                          isActive
                            ? "bg-primary text-white font-medium shadow-sm"
                            : "text-foreground/70 hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-5 h-5 shrink-0",
                            isActive ? "text-white" : "text-muted-foreground"
                          )}
                        />
                        <span className="text-sm truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 py-3 border-t border-border/50">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full",
                  location === "/settings"
                    ? "bg-primary text-white font-medium shadow-sm"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                <Settings className={cn("w-5 h-5 shrink-0", location === "/settings" ? "text-white" : "text-muted-foreground")} />
                <span className="text-sm">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/70 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-5 h-5 shrink-0 text-muted-foreground" />
                <span className="text-sm">Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
