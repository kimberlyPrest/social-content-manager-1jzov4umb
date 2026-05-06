import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export default function TeamPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'criador',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isMaster = user?.role === 'master'
  const isAdmin = user?.role === 'admin'
  const canManage = isMaster || isAdmin

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const records = await pb.collection('users').getFullList({
          sort: '-created',
        })
        setMembers(records)
      } catch (err) {
        toast.error('Erro ao carregar membros da equipe.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMembers()
    }
  }, [user])

  const handleInvite = async () => {
    setErrors({})
    setSubmitting(true)
    try {
      const password = Math.random().toString(36).slice(-8) + 'A@1'

      const newMember = await pb.collection('users').create({
        email: inviteData.email,
        name: inviteData.name,
        role: inviteData.role,
        password,
        passwordConfirm: password,
        empresa_id: user?.empresa_id,
        ativo: true,
      })

      setMembers((prev) => [newMember, ...prev])
      toast.success(`Convite enviado para ${inviteData.email}!`)
      setIsInviteOpen(false)
      setInviteData({ email: '', name: '', role: 'criador' })
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      } else {
        toast.error('Erro ao enviar convite.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este membro?')) return
    try {
      await pb.collection('users').delete(id)
      setMembers((prev) => prev.filter((m) => m.id !== id))
      toast.success('Membro removido com sucesso.')
    } catch (err) {
      toast.error('Erro ao remover membro.')
    }
  }

  const roleColors: Record<string, string> = {
    master: 'bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800',
    admin: 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800',
    criador: 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800',
    analista: 'bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800',
  }

  const formatRole = (r: string) => {
    if (!r) return ''
    return r.charAt(0).toUpperCase() + r.slice(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground mt-1">Gerencie os membros da sua equipe.</p>
        </div>

        {isMaster && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Convidar Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Convidar Novo Membro</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={inviteData.name}
                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  />
                  {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  />
                  {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Nível de acesso</Label>
                  <Select
                    value={inviteData.role}
                    onValueChange={(val) => setInviteData({ ...inviteData, role: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="criador">Criador</SelectItem>
                      <SelectItem value="analista">Analista</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <span className="text-sm text-red-500">{errors.role}</span>}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleInvite} disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar convite'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex flex-col items-center pt-6 space-y-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card
              key={member.id}
              className="relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              <CardContent className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
                <Avatar className="h-20 w-20 mb-4 border border-gray-100 shadow-sm">
                  <AvatarImage src={member.foto_url} />
                  <AvatarFallback className="text-xl bg-slate-100 text-slate-600">
                    {member.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg leading-tight mb-1 truncate w-full">
                  {member.name || 'Sem nome'}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 truncate w-full">{member.email}</p>

                {member.data_nascimento && (
                  <p className="text-sm text-slate-500 mb-4">
                    Nascimento:{' '}
                    <span className="font-medium text-slate-700">
                      {format(new Date(member.data_nascimento), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </p>
                )}

                <Badge
                  variant="secondary"
                  className={`capitalize px-3 py-1 border-transparent ${roleColors[member.role] || ''}`}
                >
                  {formatRole(member.role)}
                </Badge>

                {/* Actions overlay */}
                {canManage && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-sm"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4 text-slate-600" />
                    </Button>
                    {isMaster && member.id !== user?.id && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-sm"
                        onClick={() => handleDelete(member.id)}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-white/50">
          Nenhum membro encontrado.
        </div>
      )}
    </div>
  )
}
