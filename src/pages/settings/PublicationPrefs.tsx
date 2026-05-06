import { useState, useEffect } from 'react'
import { getPreferenciasUsuario, savePreferenciaUsuario } from '@/services/preferencias_usuario'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function PublicationPrefs() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [horario, setHorario] = useState('12:00')
  const [rede, setRede] = useState('instagram')
  const [autoPub, setAutoPub] = useState(false)
  const [notifyPub, setNotifyPub] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const prefs = await getPreferenciasUsuario()
        prefs.forEach((p) => {
          if (p.tipo === 'horario_publicacao') setHorario(p.valor)
          if (p.tipo === 'rede_preferida') setRede(p.valor)
          if (p.tipo === 'publicar_automaticamente') setAutoPub(p.valor === 'true')
          if (p.tipo === 'notificar_publicacao') setNotifyPub(p.valor === 'true')
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
        savePreferenciaUsuario('horario_publicacao', horario),
        savePreferenciaUsuario('rede_preferida', rede),
        savePreferenciaUsuario('publicar_automaticamente', autoPub ? 'true' : 'false'),
        savePreferenciaUsuario('notificar_publicacao', notifyPub ? 'true' : 'false'),
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
        <CardTitle>Preferências de Publicação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Horário padrão</Label>
            <Input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Rede social padrão</Label>
            <Select value={rede} onValueChange={setRede}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 pr-4">
            <Label>Publicar automaticamente</Label>
            <p className="text-sm text-muted-foreground">
              Publicar no horário agendado sem aprovação manual.
            </p>
          </div>
          <Switch checked={autoPub} onCheckedChange={setAutoPub} />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 pr-4">
            <Label>Notificar ao publicar</Label>
            <p className="text-sm text-muted-foreground">
              Receber alerta quando um post for ao ar.
            </p>
          </div>
          <Switch checked={notifyPub} onCheckedChange={setNotifyPub} />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </CardContent>
    </Card>
  )
}
