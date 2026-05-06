import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  BarChart2,
  FileText,
  LayoutDashboard,
  Settings,
  SplitSquareHorizontal,
  Activity,
  PieChart,
  Users,
  PenTool,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

const navItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    colorClass: 'text-[#3B82F6]',
    bgActive: 'data-[active=true]:bg-[#3B82F6]/10',
  },
  {
    title: 'Posts',
    icon: FileText,
    path: '/posts',
    colorClass: 'text-[#EC4899]',
    bgActive: 'data-[active=true]:bg-[#EC4899]/10',
  },
  {
    title: 'Criador',
    icon: PenTool,
    path: '/activity',
    colorClass: 'text-[#A855F7]',
    bgActive: 'data-[active=true]:bg-[#A855F7]/10',
  },
  {
    title: 'Monitoramento',
    icon: Activity,
    path: '/monitor',
    colorClass: 'text-[#EF4444]',
    bgActive: 'data-[active=true]:bg-[#EF4444]/10',
  },
  {
    title: 'Relatórios',
    icon: PieChart,
    path: '/reports',
    colorClass: 'text-[#10B981]',
    bgActive: 'data-[active=true]:bg-[#10B981]/10',
  },
  {
    title: 'Testes A/B',
    icon: SplitSquareHorizontal,
    path: '/ab-tests',
    colorClass: 'text-[#F97316]',
    bgActive: 'data-[active=true]:bg-[#F97316]/10',
  },
  {
    title: 'Equipe',
    icon: Users,
    path: '/team',
    colorClass: 'text-[#FBBF24]',
    bgActive: 'data-[active=true]:bg-[#FBBF24]/10',
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/settings',
    colorClass: 'text-[#6B7280]',
    bgActive: 'data-[active=true]:bg-[#6B7280]/10',
  },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="bg-[#1F2937] border-r-0"
        style={
          {
            '--sidebar-background': '#1F2937',
            '--sidebar-foreground': '#F3F4F6',
            '--sidebar-accent': 'rgba(255,255,255,0.05)',
            '--sidebar-accent-foreground': '#F3F4F6',
          } as React.CSSProperties
        }
      >
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-white/10 text-[#F3F4F6]">
          <div className="flex items-center gap-2 font-bold text-xl px-2 w-full overflow-hidden">
            <BarChart2 className="h-8 w-8 text-[#3B82F6] shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden truncate">Supremo Aroma</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 pt-4">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className={cn(
                      'group transition-all duration-200 text-[#F3F4F6] hover:bg-white/10 hover:text-[#F3F4F6] mb-1',
                      'h-11 group-data-[collapsible=icon]:!size-11 [&>svg]:!size-6',
                      item.bgActive,
                      isActive && 'font-semibold',
                    )}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'h-6 w-6 shrink-0 transition-all duration-200 group-hover:brightness-[1.20]',
                          item.colorClass,
                          isActive ? 'saturate-100' : '',
                        )}
                      />
                      <span className="text-base truncate group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 text-center">
          <p className="text-xs text-slate-400 group-data-[collapsible=icon]:hidden">
            © 2026 Supremo Aroma
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-8 animate-fade-in bg-slate-50">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
