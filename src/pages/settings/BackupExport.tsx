import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Download,
  Trash2,
  FileJson,
  FileSpreadsheet,
  History,
  RefreshCcw,
  UploadCloud,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getBackups,
  deleteBackup,
  exportData,
  getConfiguracaoBackup,
  saveConfiguracaoBackup,
} from '@/services/backups'
import pb from '@/lib/pocketbase/client'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default function BackupExport() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [configId, setConfigId] = useState<string | null>(null)
  const [autoBackupActive, setAutoBackupActive] = useState(false)
  const [frequency, setFrequency] = useState('semanal')
  const [time, setTime] = useState('00:00')

  const [exportTypes, setExportTypes] = useState<string[]>([
    'posts',
    'metricas',
    'comentarios',
    'atividades',
  ])
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportPeriod, setExportPeriod] = useState('7')
  const [customDateStart, setCustomDateStart] = useState('')
  const [customDateEnd, setCustomDateEnd] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const [backups, setBackups] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    if (user?.empresa_id) {
      loadConfig()
      loadHistory(1)
    }
  }, [user])

  const loadConfig = async () => {
    const cfg = await getConfiguracaoBackup(user.empresa_id)
    if (cfg) {
      setConfigId(cfg.id)
      setAutoBackupActive(cfg.ativo)
      setFrequency(cfg.frequencia)
      setTime(cfg.horario)
    }
  }

  const loadHistory = async (p: number) => {
    setLoadingHistory(true)
    try {
      const res = await getBackups(p)
      setBackups(res.items)
      setTotalPages(res.totalPages)
      setPage(res.page)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleExport = async () => {
    if (exportTypes.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Selecione pelo menos um tipo de dado.',
        variant: 'destructive',
      })
      return
    }
    setIsExporting(true)
    try {
      const payload = {
        tipos: exportTypes,
        formato: exportFormat,
        periodo: exportPeriod,
        custom_start: exportPeriod === 'custom' ? customDateStart : undefined,
        custom_end: exportPeriod === 'custom' ? customDateEnd : undefined,
      }
      const res = await exportData(payload)
      toast({ title: 'Sucesso', description: 'Dados exportados com sucesso!' })

      const fileUrl = pb.files.getUrl(res, res.arquivo_url)
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = res.arquivo_url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      loadHistory(1)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao exportar dados.', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      const payload = {
        empresa_id: user.empresa_id,
        ativo: autoBackupActive,
        frequencia: frequency,
        horario: time,
      }
      const res = await saveConfiguracaoBackup(configId, payload)
      setConfigId(res.id)
      toast({ title: 'Sucesso', description: 'Backup automático configurado!' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao salvar configuração.', variant: 'destructive' })
    }
  }

  const handleDeleteBackup = async (id: string) => {
    try {
      await deleteBackup(id)
      toast({ title: 'Sucesso', description: 'Backup deletado com sucesso!' })
      loadHistory(page)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao deletar backup.', variant: 'destructive' })
    }
  }

  const handleTypeToggle = (type: string, checked: boolean) => {
    if (type === 'tudo') {
      if (checked) {
        setExportTypes(['posts', 'metricas', 'comentarios', 'atividades'])
      } else {
        setExportTypes([])
      }
      return
    }

    if (checked) {
      setExportTypes([...exportTypes, type])
    } else {
      setExportTypes(exportTypes.filter((t) => t !== type))
    }
  }

  const isAllChecked = exportTypes.length === 4

  return (
    <div className="grid gap-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-slate-500" /> Exportação de Dados
          </CardTitle>
          <CardDescription>
            Selecione os dados, formato e período para baixar manualmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Tipos de Dados</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-tudo"
                  checked={isAllChecked}
                  onCheckedChange={(c) => handleTypeToggle('tudo', c as boolean)}
                />
                <label htmlFor="export-tudo" className="text-sm font-medium leading-none">
                  Tudo
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-posts"
                  checked={exportTypes.includes('posts')}
                  onCheckedChange={(c) => handleTypeToggle('posts', c as boolean)}
                />
                <label htmlFor="export-posts" className="text-sm font-medium leading-none">
                  Posts
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-metricas"
                  checked={exportTypes.includes('metricas')}
                  onCheckedChange={(c) => handleTypeToggle('metricas', c as boolean)}
                />
                <label htmlFor="export-metricas" className="text-sm font-medium leading-none">
                  Métricas
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-comentarios"
                  checked={exportTypes.includes('comentarios')}
                  onCheckedChange={(c) => handleTypeToggle('comentarios', c as boolean)}
                />
                <label htmlFor="export-comentarios" className="text-sm font-medium leading-none">
                  Comentários
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-atividades"
                  checked={exportTypes.includes('atividades')}
                  onCheckedChange={(c) => handleTypeToggle('atividades', c as boolean)}
                />
                <label htmlFor="export-atividades" className="text-sm font-medium leading-none">
                  Atividades
                </label>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" /> CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4" /> JSON
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={exportPeriod} onValueChange={setExportPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="custom">Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {exportPeriod === 'custom' && (
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50 border-t py-4">
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exportando...' : 'Exportar agora'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-slate-500" /> Backup Automático
          </CardTitle>
          <CardDescription>Agende backups recorrentes da sua base de dados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Ativar backup automático</Label>
              <p className="text-sm text-slate-500">
                Backups gerados no formato JSON com todos os dados.
              </p>
            </div>
            <Switch
              checked={autoBackupActive}
              onCheckedChange={setAutoBackupActive}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          {autoBackupActive && (
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up">
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diaria">Diária</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00:00">00:00</SelectItem>
                    <SelectItem value="06:00">06:00</SelectItem>
                    <SelectItem value="12:00">12:00</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                    <SelectItem value="23:00">23:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50 border-t py-4">
          <Button variant="outline" onClick={handleSaveConfig}>
            Salvar configuração
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" /> Histórico de Backups
          </CardTitle>
          <CardDescription>Acesse os backups gerados anteriormente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingHistory ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : backups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                      Nenhum backup realizado
                    </TableCell>
                  </TableRow>
                ) : (
                  backups.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        {format(new Date(b.created), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="capitalize">{b.tipo}</TableCell>
                      <TableCell>{formatBytes(b.tamanho)}</TableCell>
                      <TableCell>
                        {b.status === 'sucesso' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Sucesso
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Falha
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(pb.files.getUrl(b, b.arquivo_url), '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O arquivo de backup será excluído
                                  permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBackup(b.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && loadHistory(page - 1)}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => loadHistory(i + 1)}
                        isActive={page === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => page < totalPages && loadHistory(page + 1)}
                      className={
                        page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="opacity-50 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-slate-500" /> Restaurar Backup (Em breve)
          </CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível na próxima versão do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg bg-slate-50">
            <div className="text-center">
              <UploadCloud className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">
                Arraste seu arquivo .json ou .csv aqui
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t py-4">
          <Button disabled variant="secondary">
            Restaurar Dados
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
