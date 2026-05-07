import { useState, useEffect } from 'react'
import { Plus, Instagram, Pencil, Check, X, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useEmpresaContext } from '@/hooks/use-empresa-context'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Company {
  id: string
  nome: string
  tipo: 'principal' | 'secundaria'
  instagram_business_id: string
  organizacao_id: string
}

interface TeamUser {
  id: string
  name: string
  email: string
  role: string
  empresa_id: string
  empresas_acesso: string[]
}

export default function Companies() {
  const { user } = useAuth()
  const { reloadEmpresas } = useEmpresaContext()
  const [companies, setCompanies] = useState<Company[]>([])
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([])
  const [loading, setLoading] = useState(true)

  // criação
  const [createOpen, setCreateOpen] = useState(false)
  const [newNome, setNewNome] = useState('')
  const [newIgId, setNewIgId] = useState('')
  const [creating, setCreating] = useState(false)

  // edição de instagram_business_id
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editIgId, setEditIgId] = useState('')

  // gestão de usuários
  const [usersOpen, setUsersOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedUserId, setSelectedUserId] = useState('')

  const primaryId = user?.empresa_id

  const load = async () => {
    setLoading(true)
    try {
      const [cos, us] = await Promise.all([
        pb.collection('companies').getFullList<Company>({ sort: 'nome' }),
        pb.collection('users').getFullList<TeamUser>({
          filter: `empresa_id = "${primaryId}"`,
          sort: 'name',
        }),
      ])
      setCompanies(cos)
      setTeamUsers(us)
    } catch {
      toast.error('Erro ao carregar empresas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!newNome.trim()) return toast.error('Informe o nome da empresa.')
    if (!newIgId.trim()) return toast.error('Informe o Instagram Business Account ID.')
    setCreating(true)
    try {
      await pb.collection('companies').create({
        nome: newNome.trim(),
        tipo: 'secundaria',
        organizacao_id: primaryId,
        instagram_business_id: newIgId.trim(),
      })
      toast.success('Empresa secundária criada.')
      setCreateOpen(false)
      setNewNome('')
      setNewIgId('')
      await load()
      await reloadEmpresas()
    } catch {
      toast.error('Erro ao criar empresa.')
    } finally {
      setCreating(false)
    }
  }

  const handleSaveIgId = async (companyId: string) => {
    try {
      await pb.collection('companies').update(companyId, {
        instagram_business_id: editIgId.trim(),
      })
      toast.success('ID do Instagram atualizado.')
      setEditingId(null)
      await load()
    } catch {
      toast.error('Erro ao salvar.')
    }
  }

  const handleToggleUserAccess = async (userId: string, companyId: string, hasAccess: boolean) => {
    const u = teamUsers.find((t) => t.id === userId)
    if (!u) return
    const current: string[] = Array.isArray(u.empresas_acesso) ? u.empresas_acesso : []
    const updated = hasAccess
      ? current.filter((id) => id !== companyId)
      : [...current, companyId]
    try {
      await pb.collection('users').update(userId, { empresas_acesso: updated })
      toast.success(hasAccess ? 'Acesso removido.' : 'Acesso concedido.')
      await load()
    } catch {
      toast.error('Erro ao atualizar acesso.')
    }
  }

  const usersWithAccess = selectedCompany
    ? teamUsers.filter((u) => {
        const acesso: string[] = Array.isArray(u.empresas_acesso) ? u.empresas_acesso : []
        return acesso.includes(selectedCompany.id)
      })
    : []

  const usersWithoutAccess = selectedCompany
    ? teamUsers.filter((u) => {
        const acesso: string[] = Array.isArray(u.empresas_acesso) ? u.empresas_acesso : []
        return u.empresa_id !== selectedCompany.id && !acesso.includes(selectedCompany.id)
      })
    : []

  if (loading) return <div className="text-sm text-muted-foreground">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Empresas da organização</h2>
          <p className="text-sm text-muted-foreground mt-1">
            A empresa principal tem todas as integrações. Secundárias apenas Instagram.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova empresa
        </Button>
      </div>

      <div className="space-y-3">
        {companies.map((company) => (
          <Card key={company.id} className="border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{company.nome}</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      company.tipo === 'principal'
                        ? 'text-indigo-600 border-indigo-200'
                        : 'text-pink-600 border-pink-200'
                    }
                  >
                    {company.tipo === 'principal' ? 'Principal' : 'Secundária'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCompany(company)
                    setUsersOpen(true)
                  }}
                >
                  <Users className="h-4 w-4 mr-1.5" />
                  Usuários
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-500 shrink-0" />
                <span className="text-sm text-muted-foreground w-48 shrink-0">
                  Instagram Business ID:
                </span>
                {editingId === company.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editIgId}
                      onChange={(e) => setEditIgId(e.target.value)}
                      placeholder="ex: 17841400781702534"
                      className="h-7 text-sm"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleSaveIgId(company.id)}
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <code className="text-sm bg-muted px-2 py-0.5 rounded">
                      {company.instagram_business_id || (
                        <span className="text-muted-foreground italic">não configurado</span>
                      )}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingId(company.id)
                        setEditIgId(company.instagram_business_id || '')
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal criar empresa secundária */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova empresa secundária</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome da empresa</Label>
              <Input
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                placeholder="ex: Supremo Aroma SP"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Instagram Business Account ID</Label>
              <Input
                value={newIgId}
                onChange={(e) => setNewIgId(e.target.value)}
                placeholder="ex: 17841400781702534"
              />
              <p className="text-xs text-muted-foreground">
                Encontre em Meta Business Suite → Contas → Contas do Instagram.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Criando...' : 'Criar empresa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal gerenciar usuários */}
      <Dialog open={usersOpen} onOpenChange={setUsersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso a — {selectedCompany?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {usersWithAccess.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Com acesso
                </p>
                {usersWithAccess.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleToggleUserAccess(u.id, selectedCompany!.id, true)}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {usersWithoutAccess.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Sem acesso
                </p>
                {usersWithoutAccess.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleToggleUserAccess(u.id, selectedCompany!.id, false)}
                    >
                      Dar acesso
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {usersWithAccess.length === 0 && usersWithoutAccess.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum usuário disponível.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsersOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
