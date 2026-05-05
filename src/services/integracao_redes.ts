import pb from '@/lib/pocketbase/client'

export interface IntegracaoRede {
  id: string
  empresa_id: string
  rede_social: 'facebook' | 'instagram' | 'linkedin' | 'tiktok'
  access_token: string
  status: 'conectado' | 'desconectado' | 'expirado'
  data_expiracao?: string
  created: string
  updated: string
}

export const getIntegracoes = () => pb.collection('integracao_redes').getFullList<IntegracaoRede>()

export const getIntegracao = (id: string) =>
  pb.collection('integracao_redes').getOne<IntegracaoRede>(id)

export const createIntegracao = (data: Partial<IntegracaoRede>) =>
  pb.collection('integracao_redes').create<IntegracaoRede>(data)

export const updateIntegracao = (id: string, data: Partial<IntegracaoRede>) =>
  pb.collection('integracao_redes').update<IntegracaoRede>(id, data)

export const deleteIntegracao = (id: string) => pb.collection('integracao_redes').delete(id)
