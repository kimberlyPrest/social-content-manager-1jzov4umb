import { useState, useEffect } from 'react'
import { getPreferenciasUsuario, savePreferenciaUsuario } from '@/services/preferencias_usuario'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function Notifications() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)
  const [frequencia, setFrequencia] = useState('diaria')
  const [baixoEng, setBaixoEng] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const prefs = await getPreferenciasUsuario()
        prefs.forEach((p) => {
          if (p.tipo === 'notificacao_email') setEmailNotif(p.valor === 'true')
          if (p.tipo === 'notificacao_push') setPushNotif(p.valor === 'true')
          if (p.tipo === 'frequencia_resumo') setFrequencia(p.valor)
          if (p.tipo === 'alerta_baixo_engajamento') setBaixoEng(p.valor === 'true')
        })
      } catch (err) {
        toast.error('Erro ao carregar configurações')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        savePreferenciaUsuario('notificacao_email', emailNotif ? 'true' : 'false'),
        savePreferenciaUsuario('notificacao_push', pushNotif ? 'true' : 'false'),
        savePreferenciaUsuario('frequencia_resumo', frequencia),
        savePreferenciaUsuario('alerta_baixo_engajamento', baixoEng ? 'true' : 'false'),
      ])
      toast.success('Configurações salvas com sucesso!')
    } catch (err) {
      toast.error('Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receba alertas importantes no email.</p>
          </div>
          <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 pr-4">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Notificações no navegador ou app.</p>
          </div>
          <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 pr-4">
            <Label>Alertas de baixo engajamento</Label>
            <p className="text-sm text-muted-foreground">
              Avise quando o post estiver abaixo da média.
            </p>
          </div>
          <Switch checked={baixoEng} onCheckedChange={setBaixoEng} />
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label>Frequência de resumo</Label>
          <Select value={frequencia} onValueChange={setFrequencia}>
            <SelectTrigger className="max-w-[300px]">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diaria">Diária</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </CardContent>
    </Card>
  )
}
