import { NavLink, useLocation } from "react-router-dom"
import {
  BarChart3,
  Calendar,
  Users,
  Workflow,
  TrendingUp,
  Shield,
  HeatMap,
  Settings,
  Mail
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Planner", url: "/planner", icon: Calendar },
  { title: "Audiences", url: "/audiences", icon: Users },
  { title: "Automations", url: "/automations", icon: Workflow },
  { title: "Warm-up Wizard", url: "/warm-up", icon: TrendingUp },
  { title: "Deliverability Guardrails", url: "/guardrails", icon: Shield },
  { title: "Reports", url: "/reports", icon: HeatMap },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { collapsed } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50"

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Mail className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-semibold text-sidebar-foreground">EverInbox</h2>
              <p className="text-xs text-sidebar-foreground/70">Publisher Edition</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}