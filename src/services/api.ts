import pb from '@/lib/pocketbase/client'

export const getDashboardStats = async () => {
  const metrics = await pb.collection('metrics_posts').getFullList()

  return metrics.reduce(
    (acc, m) => {
      acc.curtidas += m.curtidas || 0
      acc.comentarios += m.comentarios || 0
      acc.compartilhamentos += m.compartilhamentos || 0
      acc.alcance += m.alcance || 0
      return acc
    },
    { curtidas: 0, comentarios: 0, compartilhamentos: 0, alcance: 0 },
  )
}

export const getPosts = async (limit = 10) => {
  return pb.collection('posts').getList(1, limit, {
    sort: '-created',
    expand: 'criador_id',
  })
}

export const createPost = async (data: any) => {
  data.status = data.status || 'rascunho'
  return pb.collection('posts').create(data)
}

export const getABTests = async () => {
  return pb.collection('ab_tests').getFullList({
    expand: 'post_id_a,post_id_b',
    sort: '-created',
  })
}

export const getUnreadNotifications = async () => {
  return pb.collection('notifications').getFullList({
    filter: 'lida = false',
    sort: '-created',
  })
}

export const markNotificationRead = async (id: string) => {
  return pb.collection('notifications').update(id, { lida: true })
}
