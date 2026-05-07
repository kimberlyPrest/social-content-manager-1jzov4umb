import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CompanyProfile from './settings/CompanyProfile'
import PublicationPrefs from './settings/PublicationPrefs'
import Notifications from './settings/Notifications'
import PresetMessages from './settings/PresetMessages'
import Integrations from './settings/Integrations'
import Security from './settings/Security'
import BackupExport from './settings/BackupExport'
import Companies from './settings/Companies'

export default function SettingsPage() {
  const { user } = useAuth()
  const isMaster = user?.role === 'master'
  const isAdmin = user?.role === 'admin'
  const canEditGlobal = isMaster || isAdmin

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h1>

      <Tabs defaultValue={canEditGlobal ? 'empresa' : 'seguranca'} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto justify-start gap-2 bg-transparent p-0 mb-6">
          {canEditGlobal && (
            <TabsTrigger
              value="empresa"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
            >
              Empresa
            </TabsTrigger>
          )}
          {canEditGlobal && (
            <TabsTrigger
              value="publicacao"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
            >
              Publicação
            </TabsTrigger>
          )}
          {canEditGlobal && (
            <TabsTrigger
              value="notificacoes"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
            >
              Notificações
            </TabsTrigger>
          )}
          {canEditGlobal && (
            <TabsTrigger
              value="mensagens"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
            >
              Respostas
            </TabsTrigger>
          )}
          {canEditGlobal && (
            <TabsTrigger
              value="empresas"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
            >
              Empresas
            </TabsTrigger>
          )}
          {isMaster && (
            <TabsTrigger
              value="integracoes"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
            >
              Integrações
            </TabsTrigger>
          )}
          {canEditGlobal && (
            <TabsTrigger
              value="backup"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
            >
              Backup e Exportação
            </TabsTrigger>
          )}
          <TabsTrigger
            value="seguranca"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200"
          >
            Segurança
          </TabsTrigger>
        </TabsList>

        <div className="animate-fade-in">
          {canEditGlobal && (
            <TabsContent value="empresa" className="mt-0">
              <CompanyProfile />
            </TabsContent>
          )}
          {canEditGlobal && (
            <TabsContent value="publicacao" className="mt-0">
              <PublicationPrefs />
            </TabsContent>
          )}
          {canEditGlobal && (
            <TabsContent value="notificacoes" className="mt-0">
              <Notifications />
            </TabsContent>
          )}
          {canEditGlobal && (
            <TabsContent value="mensagens" className="mt-0">
              <PresetMessages />
            </TabsContent>
          )}
          {canEditGlobal && (
            <TabsContent value="empresas" className="mt-0">
              <Companies />
            </TabsContent>
          )}
          {isMaster && (
            <TabsContent value="integracoes" className="mt-0">
              <Integrations />
            </TabsContent>
          )}
          {canEditGlobal && (
            <TabsContent value="backup" className="mt-0">
              <BackupExport />
            </TabsContent>
          )}
          <TabsContent value="seguranca" className="mt-0">
            <Security />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
