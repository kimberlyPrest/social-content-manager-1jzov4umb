import { LogOut, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
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
import logoUrl from '@/assets/logo-supremo-aroma-e0694.png'

export function Header() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Link to="/" className="transition-opacity hover:opacity-80">
          <img src={logoUrl} alt="Supremo Aroma" className="h-8 w-auto md:h-10 object-contain" />
        </Link>
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
