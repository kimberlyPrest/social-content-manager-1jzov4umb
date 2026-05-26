import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Sparkles } from 'lucide-react'
import { getAITitles, generateAICampaign, getBestPostingDays } from '@/services/api'
import { useEmpresaContext } from '@/hooks/use-empresa-context'
import { toast } from 'sonner'

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

export function AiCampaignModal({
  isOpen,
  onClose,
  connectedNetworks,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  connectedNetworks: string[]
  onSuccess: () => void
}) {
  const { activeEmpresaId } = useEmpresaContext()
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitles, setSelectedTitles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [bestDays, setBestDays] = useState<number[]>([1, 4])
  const [useSuggestedDays, setUseSuggestedDays] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadData()
    } else {
      setSelectedTitles([])
    }
  }, [isOpen, activeEmpresaId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [titlesRes, days] = await Promise.all([
        getAITitles(),
        getBestPostingDays(activeEmpresaId),
      ])
      setTitles(titlesRes.titles)
      setBestDays(days)
    } catch (err) {
      toast.error('Erro ao carregar dados da IA.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTitle = (title: string) => {
    setSelectedTitles((prev) => {
      if (prev.includes(title)) return prev.filter((t) => t !== title)
      if (prev.length >= 2) return prev
      return [...prev, title]
    })
  }

  const handleGenerate = async () => {
    if (selectedTitles.length !== 2) {
      toast.error('Selecione exatamente 2 títulos.')
      return
    }
    setGenerating(true)
    try {
      const daysToUse = useSuggestedDays ? bestDays : [1, 4]
      await generateAICampaign(selectedTitles, connectedNetworks, daysToUse)
      toast.success('Campanha gerada e agendada com sucesso!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Erro ao gerar campanha.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Assistente de Campanha Inteligente
          </DialogTitle>
          <DialogDescription>
            Escolha 2 títulos abaixo. A IA irá gerar os artigos de blog otimizados para SEO e
            automaticamente criar e agendar 2 posts derivados para cada rede social sua.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-slate-700">
                Títulos Sugeridos (Selecione 2)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {titles.map((title, i) => {
                  const isSelected = selectedTitles.includes(title)
                  const isDisabled = !isSelected && selectedTitles.length >= 2
                  return (
                    <div
                      key={i}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 cursor-pointer'
                          : 'hover:bg-slate-50 cursor-pointer'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isDisabled && handleToggleTitle(title)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="mt-1"
                        id={`title-${i}`}
                      />
                      <label
                        htmlFor={`title-${i}`}
                        className={`text-sm font-medium leading-tight ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {title}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border space-y-2">
              <h4 className="font-medium text-sm text-slate-700">Estratégia de Distribuição</h4>
              <p className="text-xs text-slate-500">
                Analisamos o histórico da sua empresa. Os melhores dias para postagem parecem ser{' '}
                <strong className="text-slate-700">
                  {DAYS_OF_WEEK[bestDays[0]]} e {DAYS_OF_WEEK[bestDays[1]]}
                </strong>
                .
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="use-suggested-days"
                  checked={useSuggestedDays}
                  onCheckedChange={(val) => setUseSuggestedDays(!!val)}
                />
                <label htmlFor="use-suggested-days" className="text-sm cursor-pointer">
                  Agendar posts base (Blogs) para estes dias otimizados.
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Os posts derivados para as redes sociais (
                {connectedNetworks.join(', ') || 'Nenhuma conectada'}) serão agendados
                automaticamente nos dias subsequentes.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={generating}>
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={selectedTitles.length !== 2 || generating}
                className="bg-purple-700 hover:bg-purple-800 text-white gap-2"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Gerar e Agendar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
