import { Pencil, Trash2, Zap, Settings, Workflow } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Automation } from '@/services/automations'

const TRIGGER_LABELS = {
  post_publicado: 'Post publicado',
  novo_comentario: 'Novo comentário',
  teste_finalizado: 'Teste A/B finalizado',
  mencao: 'Menção em monitoramento',
  post_agendado: 'Post agendado',
}

interface Props {
  item: Automation
  onToggle: (id: string, current: boolean) => void
  onEdit: (item: Automation) => void
  onDelete: (id: string) => void
}

export function AutomationCard({ item, onToggle, onEdit, onDelete }: Props) {
  return (
    <Card className="flex flex-col shadow-sm transition-all hover:shadow-md bg-white border-slate-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="overflow-hidden">
            <CardTitle className="text-lg flex items-center gap-2 truncate">
              {item.titulo}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{item.descricao}</CardDescription>
          </div>
          <Badge
            variant={item.ativa ? 'default' : 'secondary'}
            className={
              item.ativa ? 'bg-emerald-500 hover:bg-emerald-600 border-transparent text-white' : ''
            }
          >
            {item.ativa ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2 text-sm text-slate-500">
          <Badge variant="outline" className="flex items-center gap-1.5 font-normal bg-slate-50">
            <Workflow className="w-3.5 h-3.5" />
            {TRIGGER_LABELS[item.gatilho]}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 font-normal bg-slate-50">
            {item.ferramenta === 'zapier' ? (
              <Zap className="w-3.5 h-3.5 text-orange-500" />
            ) : (
              <Settings className="w-3.5 h-3.5 text-purple-500" />
            )}
            {item.ferramenta === 'zapier' ? 'Zapier' : 'Make'}
          </Badge>
        </div>
        <div className="mt-4 text-xs text-slate-400">
          Criado em {format(new Date(item.created), "dd 'de' MMM, yyyy", { locale: ptBR })}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={item.ativa} onCheckedChange={() => onToggle(item.id, item.ativa)} />
          <span className="text-sm font-medium text-slate-600">
            {item.ativa ? 'Ligado' : 'Desligado'}
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(item)}
            className="h-8 w-8 text-slate-500 hover:text-slate-900"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
