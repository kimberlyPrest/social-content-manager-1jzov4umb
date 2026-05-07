import { LogOut, Building2, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useEmpresaContext } from '@/hooks/use-empresa-context'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Notifications } from './Notifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import logoUrl from '@/assets/logo-supremo-aroma-e0694.png'

export function Header() {
  const { user, signOut } = useAuth()
  const { activeEmpresa, activeEmpresaId, empresasAcessiveis, setActiveEmpresa } =
    useEmpresaContext()

  if (!user) return null

  const multiEmpresa = empresasAcessiveis.length > 1

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Link to="/" className="transition-opacity hover:opacity-80">
          <img src={logoUrl} alt="Supremo Aroma" className="h-8 w-auto md:h-10 object-contain" />
        </Link>

        {multiEmpresa && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 max-w-[220px] h-8">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{activeEmpresa?.nome ?? 'Empresa'}</span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Trocar contexto
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {empresasAcessiveis.map((empresa) => (
                <DropdownMenuItem
                  key={empresa.id}
                  onClick={() => setActiveEmpresa(empresa.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{empresa.nome}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {empresa.tipo === 'principal' && (
                      <Badge
                        variant="outline"
                        className="text-[9px] py-0 px-1 h-4 text-slate-500"
                      >
                        principal
                      </Badge>
                    )}
                    {empresa.id === activeEmpresaId && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Notifications />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                <p className="text-xs font-semibold text-primary capitalize mt-1">{user.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
