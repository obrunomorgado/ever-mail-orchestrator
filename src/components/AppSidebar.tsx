import { NavLink, useLocation } from "react-router-dom"
import {
  BarChart3,
  Calendar,
  Users,
  Workflow,
  TrendingUp,
  Shield,
  Activity,
  Settings,
  Mail,
  Tag,
  List,
  Thermometer,
  Trash2,
  GitBranch,
  FileText,
  BookOpen,
  Database
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
];

const audienceItems = [
  { title: "Segmentos", url: "/audiencias/segmentos", icon: Users },
  { title: "Tags", url: "/audiencias/tags", icon: Tag },
  { title: "Listas", url: "/audiencias/listas", icon: List },
];

const toolsItems = [
  { title: "Planner", url: "/planner-new", icon: Calendar },
  { title: "Warm-up", url: "/warmup", icon: Thermometer },
  { title: "Automação", url: "/automation", icon: GitBranch },
  { title: "Limpeza", url: "/cleaning", icon: Trash2 },
  { title: "Macros", url: "/macros", icon: FileText },
  { title: "Receitas", url: "/receitas", icon: BookOpen },
  { title: "Backfill", url: "/backfill", icon: Database },
  { title: "Análise de Engajamento", url: "/engagement-analysis", icon: BarChart3 },
];

const reportItems = [
  { title: "Guardrails", url: "/guardrails", icon: Shield },
  { title: "Heat Map", url: "/reports", icon: Activity },
  { title: "Settings", url: "/settings", icon: Settings },
];


export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50"

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Mail className="h-4 w-4 text-primary-foreground" />
          </div>
          {state !== "collapsed" && (
            <div>
              <h2 className="text-sm font-semibold text-sidebar-foreground">EverInbox</h2>
              <p className="text-xs text-sidebar-foreground/70">Publisher Edition</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Audiências</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {audienceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
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