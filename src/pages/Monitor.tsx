import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonitoringSidebar } from '@/components/monitor/MonitoringSidebar'
import { MonitoringStream } from '@/components/monitor/MonitoringStream'
import { OpportunitiesPanel } from '@/components/monitor/OpportunitiesPanel'
import { AddMonitoringModal } from '@/components/monitor/AddMonitoringModal'

export default function Monitor() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      <div className="flex items-center justify-between p-4 border-b shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Dashboard
            </Link>
          </Button>
          <h1 className="text-lg font-bold hidden sm:block">Monitoramento em Tempo Real</h1>
        </div>
        <AddMonitoringModal />
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-muted/20">
        <div className="hidden md:flex w-full h-full">
          <div className="w-64 lg:w-80 border-r bg-background shrink-0 flex flex-col">
            <MonitoringSidebar />
          </div>
          <div className="flex-1 min-w-0 border-r flex flex-col h-full bg-background/50">
            <MonitoringStream />
          </div>
          <div className="w-80 xl:w-96 shrink-0 bg-background flex flex-col">
            <OpportunitiesPanel />
          </div>
        </div>

        <div className="md:hidden flex-1 flex flex-col h-full overflow-hidden">
          <Tabs defaultValue="stream" className="flex flex-col h-full">
            <div className="px-4 py-2 border-b bg-background">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stream">Stream</TabsTrigger>
                <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
                <TabsTrigger value="rules">Regras</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="stream"
              className="flex-1 overflow-hidden p-0 m-0 data-[state=active]:flex flex-col"
            >
              <MonitoringStream />
            </TabsContent>
            <TabsContent
              value="opportunities"
              className="flex-1 overflow-hidden p-0 m-0 data-[state=active]:flex flex-col"
            >
              <OpportunitiesPanel />
            </TabsContent>
            <TabsContent
              value="rules"
              className="flex-1 overflow-hidden p-0 m-0 data-[state=active]:flex flex-col"
            >
              <MonitoringSidebar />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
