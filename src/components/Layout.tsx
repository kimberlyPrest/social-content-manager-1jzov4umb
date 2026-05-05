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
  Clock,
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

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { title: 'Posts', icon: FileText, path: '/posts' },
  { title: 'Monitoramento', icon: Activity, path: '/monitor' },
  { title: 'Relatórios', icon: PieChart, path: '/reports' },
  { title: 'Testes A/B', icon: SplitSquareHorizontal, path: '/ab-tests' },
  { title: 'Atividades', icon: Clock, path: '/activity' },
  { title: 'Equipe', icon: Users, path: '/team' },
  { title: 'Configurações', icon: Settings, path: '/settings' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="bg-slate-900 border-r-0">
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-white/10 text-white">
          <div className="flex items-center gap-2 font-bold text-xl px-2">
            <BarChart2 className="h-6 w-6 text-indigo-400" />
            <span>Supremo Aroma</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 pt-4">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path))
                  }
                  className="text-slate-300 hover:text-white hover:bg-white/10 data-[active=true]:bg-indigo-600 data-[active=true]:text-white mb-1"
                >
                  <Link to={item.path}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 text-center">
          <p className="text-xs text-slate-500">© 2026 Supremo Aroma</p>
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
