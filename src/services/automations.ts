import pb from '@/lib/pocketbase/client'

export interface Automation {
  id: string
  empresa_id: string
  titulo: string
  descricao: string
  gatilho: 'post_publicado' | 'novo_comentario' | 'teste_finalizado' | 'mencao' | 'post_agendado'
  ferramenta: 'zapier' | 'make'
  webhook_url: string
  ativa: boolean
  created: string
  updated: string
}

export const getAutomations = async (empresaId: string) => {
  return pb.collection('automacoes').getFullList<Automation>({
    filter: `empresa_id = "${empresaId}"`,
    sort: '-created',
  })
}

export const createAutomation = async (data: Partial<Automation>) => {
  return pb.collection('automacoes').create<Automation>(data)
}

export const updateAutomation = async (id: string, data: Partial<Automation>) => {
  return pb.collection('automacoes').update<Automation>(id, data)
}

export const deleteAutomation = async (id: string) => {
  return pb.collection('automacoes').delete(id)
}
