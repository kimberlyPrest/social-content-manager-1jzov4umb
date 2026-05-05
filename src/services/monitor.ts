import pb from '@/lib/pocketbase/client'

export const getMonitoringRules = async () => {
  return await pb.collection('monitoring').getFullList({ sort: '-created' })
}

export const createMonitoringRule = async (data: any) => {
  return await pb.collection('monitoring').create(data)
}

export const updateMonitoringRule = async (id: string, data: any) => {
  return await pb.collection('monitoring').update(id, data)
}

export const deleteMonitoringRule = async (id: string) => {
  return await pb.collection('monitoring').delete(id)
}

export const getMonitoredPosts = async (page = 1, perPage = 20, redeFiltro?: string) => {
  const options: any = { sort: '-created' }
  if (redeFiltro && redeFiltro !== 'todas') {
    options.filter = `rede_social = '${redeFiltro}'`
  }
  return await pb.collection('posts_monitorados').getList(page, perPage, options)
}

export const syncMonitoring = async () => {
  return await pb.send('/backend/v1/monitor/sync', { method: 'POST' })
}

export const getOpportunities = async () => {
  return await pb.collection('oportunidades').getFullList({ sort: '-created' })
}

export const createOpportunity = async (data: any) => {
  return await pb.collection('oportunidades').create(data)
}

export const updateOpportunity = async (id: string, data: any) => {
  return await pb.collection('oportunidades').update(id, data)
}

export const createDirectMessage = async (data: any) => {
  return await pb.collection('mensagens_diretas').create(data)
}
