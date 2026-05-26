import { useState } from 'react'
import { getAITitles, generateAICampaign, getBestPostingDays } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEmpresaContext } from '@/hooks/use-empresa-context'

interface AiCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  connectedNetworks: string[]
  onSuccess: () => void
}

const NETWORKS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
]

export function AiCampaignModal({
  isOpen,
  onClose,
  connectedNetworks,
  onSuccess,
}: AiCampaignModalProps) {
  const { activeEmpresaId } = useEmpresaContext()

  const [theme, setTheme] = useState('')
  const [loadingTitles, setLoadingTitles] = useState(false)
  const [loadingCampaign, setLoadingCampaign] = useState(false)
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitles, setSelectedTitles] = useState<string[]>([])
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([])

  const handleGenerateTitles = async () => {
    if (!theme.trim()) {
      toast.error('Por favor, informe um tema.')
      return
    }

    setLoadingTitles(true)
    setTitles([])
    setSelectedTitles([])
    try {
      const res = await getAITitles(theme)
      if (res && res.titles && Array.isArray(res.titles) && res.titles.length >= 5) {
        setTitles(res.titles)
      } else if (res && res.titles) {
        setTitles(res.titles)
      } else {
        toast.error('A IA não retornou sugestões de títulos. Tente novamente.')
      }
    } catch (err) {
      toast.error('Serviço de IA indisponível no momento. Tente novamente mais tarde.')
      console.error(err)
    } finally {
      setLoadingTitles(false)
    }
  }

  const handleGenerateCampaign = async () => {
    if (selectedTitles.length === 0) {
      toast.error('Selecione pelo menos um título.')
      return
    }
    if (selectedNetworks.length === 0) {
      toast.error('Selecione pelo menos uma rede social.')
      return
    }

    setLoadingCampaign(true)
    try {
      const bestDays = await getBestPostingDays(activeEmpresaId)
      await generateAICampaign(selectedTitles, selectedNetworks, bestDays)
      toast.success('Campanha gerada com sucesso! Rascunhos criados.')
      onClose()
      onSuccess()
    } catch (err) {
      toast.error('Erro ao gerar campanha. Tente novamente.')
      console.error(err)
    } finally {
      setLoadingCampaign(false)
    }
  }

  const toggleTitle = (title: string) => {
    setSelectedTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    )
  }

  const toggleNetwork = (network: string) => {
    setSelectedNetworks((prev) =>
      prev.includes(network) ? prev.filter((n) => n !== network) : [...prev, network],
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Gerar Campanha com IA
          </DialogTitle>
          <DialogDescription>
            Informe um tema para receber sugestões de títulos e criar rascunhos de posts
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label>Tema da Campanha</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Dicas de marketing para e-commerce"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateTitles()
                }}
              />
              <Button
                onClick={handleGenerateTitles}
                disabled={loadingTitles || !theme.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
              >
                {loadingTitles ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gerar Títulos'}
              </Button>
            </div>
          </div>

          {titles.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <Label>1. Selecione os Títulos (mín. 1)</Label>
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto p-1">
                  {titles.map((title, i) => {
                    const isSelected = selectedTitles.includes(title)
                    return (
                      <div
                        key={i}
                        onClick={() => toggleTitle(title)}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox checked={isSelected} className="mt-0.5 pointer-events-none" />
                        <span className="text-sm font-medium leading-tight">{title}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>2. Onde deseja publicar?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {NETWORKS.map((net) => {
                    const isConnected = connectedNetworks.includes(net.id)
                    return (
                      <div
                        key={net.id}
                        onClick={() => {
                          if (isConnected) toggleNetwork(net.id)
                        }}
                        className={`flex items-center space-x-3 border p-3 rounded-md transition-colors ${
                          isConnected
                            ? 'cursor-pointer hover:bg-muted/50'
                            : 'opacity-50 cursor-not-allowed bg-muted'
                        }`}
                      >
                        <Checkbox
                          id={`net-${net.id}`}
                          checked={selectedNetworks.includes(net.id)}
                          disabled={!isConnected}
                          className={isConnected ? 'pointer-events-none' : ''}
                        />
                        <div className="flex flex-col">
                          <Label
                            htmlFor={`net-${net.id}`}
                            className={isConnected ? 'cursor-pointer' : 'cursor-not-allowed'}
                          >
                            {net.label}
                          </Label>
                          {!isConnected && (
                            <span className="text-[10px] text-destructive">Desconectada</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Button
                onClick={handleGenerateCampaign}
                disabled={
                  loadingCampaign || selectedTitles.length === 0 || selectedNetworks.length === 0
                }
                className="w-full bg-purple-700 hover:bg-purple-800 text-white"
              >
                {loadingCampaign ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando rascunhos...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Criar Posts da Campanha
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
