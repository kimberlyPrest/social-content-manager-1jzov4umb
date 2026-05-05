import { useEffect, useState } from 'react'
import { Plus, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getABTests } from '@/services/api'
import { TestCard } from '@/components/ab-tests/TestCard'
import { TestDetail } from '@/components/ab-tests/TestDetail'
import { CreateTestDialog } from '@/components/ab-tests/CreateTestDialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function ABTests() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [selectedTest, setSelectedTest] = useState<any | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const loadData = () => {
    setLoading(true)
    getABTests()
      .then((data) => {
        setTests(data)
        if (selectedTest) {
          const updated = data.find((t: any) => t.id === selectedTest.id)
          if (updated) setSelectedTest(updated)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (selectedTest) {
    return (
      <TestDetail test={selectedTest} onBack={() => setSelectedTest(null)} onUpdate={loadData} />
    )
  }

  const filteredTests = tests.filter((t) => filter === 'todos' || t.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Testes A/B</h2>
          <p className="text-muted-foreground">
            Monitore experimentos e descubra a melhor estratégia de engajamento.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Criar Teste A/B
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativo">Ativos</TabsTrigger>
          <TabsTrigger value="finalizado">Finalizados</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[140px] w-full rounded-xl" />
            ))}
          </div>
        ) : filteredTests.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} onClick={() => setSelectedTest(test)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-slate-50/50">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <FlaskConical className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum teste encontrado</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Crie seu primeiro Teste A/B para comparar o desempenho de diferentes publicações e
              receber recomendações inteligentes.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} variant="outline">
              Criar primeiro teste
            </Button>
          </div>
        )}
      </Tabs>

      <CreateTestDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          setIsCreateOpen(false)
          loadData()
        }}
      />
    </div>
  )
}
