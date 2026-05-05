import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getABTests } from '@/services/api'
import { Badge } from '@/components/ui/badge'

export default function ABTests() {
  const [tests, setTests] = useState<any[]>([])

  useEffect(() => {
    getABTests()
      .then(setTests)
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Testes A/B</h2>
        <p className="text-muted-foreground">Acompanhe seus experimentos de engajamento.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tests.map((test) => (
          <Card key={test.id} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Comparativo de Engajamento</CardTitle>
              <Badge variant={test.status === 'ativo' ? 'default' : 'secondary'}>
                {test.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg border bg-slate-50">
                  <div className="font-medium text-sm">A: {test.expand?.post_id_a?.titulo}</div>
                  {test.vencedor === 'a' && <Badge className="bg-green-500">Vencedor</Badge>}
                </div>
                <div className="text-center text-muted-foreground text-xs font-semibold">VS</div>
                <div className="flex justify-between items-center p-3 rounded-lg border bg-slate-50">
                  <div className="font-medium text-sm">B: {test.expand?.post_id_b?.titulo}</div>
                  {test.vencedor === 'b' && <Badge className="bg-green-500">Vencedor</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {tests.length === 0 && (
          <div className="col-span-2 p-8 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhum teste A/B encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
