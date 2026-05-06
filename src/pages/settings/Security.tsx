import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { updateUser, deleteUserAccount } from '@/services/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

export default function Security() {
  const { user, signOut } = useAuth()
  const isMasterOrAdmin = user?.role === 'master' || user?.role === 'admin'
  const isMaster = user?.role === 'master'

  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passDialogOpen, setPassDialogOpen] = useState(false)
  const [passSaving, setPassSaving] = useState(false)

  const [twoFactor, setTwoFactor] = useState(user?.two_factor_enabled || false)
  const [twoFactorSaving, setTwoFactorSaving] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const sessions = [
    { id: 1, device: 'MacBook Pro - Chrome', location: 'São Paulo, BR', current: true },
    { id: 2, device: 'iPhone 13 - Safari', location: 'São Paulo, BR', current: false },
  ]

  const handleChangePassword = async () => {
    if (password !== passwordConfirm) {
      return toast.error('As senhas não coincidem.')
    }
    if (!user) return
    setPassSaving(true)
    try {
      await pb.collection('users').update(user.id, {
        oldPassword,
        password,
        passwordConfirm,
      })
      toast.success('Configurações salvas com sucesso!')
      setPassDialogOpen(false)
      setOldPassword('')
      setPassword('')
      setPasswordConfirm('')
    } catch (err) {
      toast.error('Erro ao atualizar a senha.')
    } finally {
      setPassSaving(false)
    }
  }

  const handleToggle2FA = async (checked: boolean) => {
    if (!user) return
    setTwoFactorSaving(true)
    setTwoFactor(checked)
    try {
      await updateUser(user.id, { two_factor_enabled: checked })
      toast.success('Configurações salvas com sucesso!')
    } catch (err) {
      setTwoFactor(!checked)
      toast.error('Erro ao salvar alterações')
    } finally {
      setTwoFactorSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    if (deleteConfirm !== 'DELETAR') {
      return toast.error('Texto de confirmação incorreto.')
    }
    try {
      await deleteUserAccount(user.id)
      signOut()
    } catch (err) {
      toast.error('Erro ao deletar conta.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Senha</CardTitle>
          <CardDescription>Atualize sua senha para manter a conta segura.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setPassDialogOpen(true)}>Alterar senha</Button>
        </CardContent>
      </Card>

      {isMasterOrAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
            <CardDescription>Adicione uma camada extra de segurança.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Label>Habilitar 2FA</Label>
            <Switch
              checked={twoFactor}
              onCheckedChange={handleToggle2FA}
              disabled={twoFactorSaving}
            />
          </CardContent>
        </Card>
      )}

      {isMasterOrAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Sessões Ativas</CardTitle>
            <CardDescription>Aparelhos conectados na sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{s.device}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.location} {s.current && '(Atual)'}
                  </p>
                </div>
                {!s.current && (
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => toast.success('Configurações salvas com sucesso!')}
                  >
                    Desconectar
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isMaster && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Deletar Conta</CardTitle>
            <CardDescription>Esta ação é irreversível.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              Deletar conta
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={passDialogOpen} onOpenChange={setPassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Senha Atual</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPassDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={passSaving || !oldPassword || !password}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Conta</DialogTitle>
            <DialogDescription>Para confirmar, digite DELETAR abaixo.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETAR"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'DELETAR'}
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
