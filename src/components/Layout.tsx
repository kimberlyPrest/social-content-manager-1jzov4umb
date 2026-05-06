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
  Share2,
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
import logoUrl from '@/assets/logo-supremo-aroma-e0694.png'

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', color: '#3B82F6' },
  { title: 'Posts', icon: FileText, path: '/posts', color: '#EC4899' },
  { title: 'Criador', icon: PenTool, path: '/activity', color: '#A855F7' },
  { title: 'Monitoramento', icon: Activity, path: '/monitor', color: '#EF4444' },
  { title: 'Relatórios', icon: PieChart, path: '/reports', color: '#10B981' },
  { title: 'Testes A/B', icon: SplitSquareHorizontal, path: '/ab-tests', color: '#F97316' },
  { title: 'Integrações', icon: Share2, path: '/integracoes', color: '#06B6D4' },
  { title: 'Equipe', icon: Users, path: '/team', color: '#FBBF24' },
  { title: 'Configurações', icon: Settings, path: '/settings', color: '#6B7280' },
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
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-white/10">
          <div className="flex items-center justify-center px-2 w-full overflow-hidden">
            <div className="bg-white/95 p-1.5 rounded-md flex items-center justify-center w-full min-h-[40px]">
              <img
                src={logoUrl}
                alt="Supremo Aroma"
                className="h-8 w-auto object-contain group-data-[collapsible=icon]:hidden"
              />
              <span className="font-bold text-lg text-[#523A28] hidden group-data-[collapsible=icon]:block">
                SA
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 pt-4">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' &&
                  item.path !== '/dashboard' &&
                  location.pathname.startsWith(item.path))
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className={cn(
                      'group transition-all duration-200 text-[#F3F4F6] hover:text-[#F3F4F6] mb-1',
                      'h-11 group-data-[collapsible=icon]:!size-11 [&>svg]:!size-6 hover:bg-[var(--hover-bg)]',
                      isActive ? 'bg-[var(--hover-bg)] font-semibold' : 'bg-transparent',
                    )}
                    style={
                      {
                        '--item-color': item.color,
                        '--hover-bg': `${item.color}1A`,
                      } as React.CSSProperties
                    }
                  >
                    <Link to={item.path} className="flex items-center gap-3 w-full">
                      <item.icon
                        className={cn(
                          'h-6 w-6 shrink-0 transition-all duration-200 group-hover:brightness-[1.25] group-hover:opacity-100',
                          isActive ? 'brightness-[1.25] opacity-100' : 'opacity-80',
                        )}
                        style={{ color: 'var(--item-color)' }}
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
