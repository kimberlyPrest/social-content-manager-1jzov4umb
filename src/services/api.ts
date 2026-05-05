import pb from '@/lib/pocketbase/client'

export const syncMetrics = async () => {
  return pb.send('/backend/v1/metrics/sync', { method: 'POST' })
}

export const getDashboardData = async (days: number = 7) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const metrics = await pb.collection('metrics_posts').getFullList({
    filter: `updated >= "${startDate.toISOString().replace('T', ' ')}"`,
    expand: 'post_id',
    sort: '+updated',
  })

  const posts = await pb.collection('posts').getFullList({
    sort: '-created',
    expand: 'criador_id',
  })

  const stats = metrics.reduce(
    (acc, m) => {
      acc.curtidas += m.curtidas || 0
      acc.comentarios += m.comentarios || 0
      acc.compartilhamentos += m.compartilhamentos || 0
      acc.alcance += m.alcance || 0
      acc.impressoes += m.impressoes || 0
      return acc
    },
    { curtidas: 0, comentarios: 0, compartilhamentos: 0, alcance: 0, impressoes: 0 },
  )

  const distData = [
    {
      name: 'Facebook',
      value: metrics.filter((m) => m.rede_social === 'facebook').length,
      fill: '#1877F2',
    },
    {
      name: 'Instagram',
      value: metrics.filter((m) => m.rede_social === 'instagram').length,
      fill: '#E4405F',
    },
    {
      name: 'LinkedIn',
      value: metrics.filter((m) => m.rede_social === 'linkedin').length,
      fill: '#0A66C2',
    },
    {
      name: 'TikTok',
      value: metrics.filter((m) => m.rede_social === 'tiktok').length,
      fill: '#000000',
    },
  ].filter((d) => d.value > 0)

  const perfMap: Record<string, number> = {}

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    perfMap[label] = 0
  }

  metrics.forEach((m) => {
    const d = new Date(m.updated)
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    if (perfMap[label] !== undefined) {
      perfMap[label] += (m.curtidas || 0) + (m.comentarios || 0)
    }
  })

  const perfData = Object.keys(perfMap).map((day) => ({
    day,
    engajamento: perfMap[day],
  }))

  return { stats, metrics, posts, distData, perfData }
}

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

export const deletePost = async (id: string) => {
  return pb.send(`/backend/v1/posts/${id}`, { method: 'DELETE' })
}

export const createPost = async (data: any) => {
  if (data.agendamento_tipo === 'agora') {
    data.status = 'agendado'
    data.agendado_para = new Date().toISOString()
  } else if (data.agendamento_tipo === 'depois') {
    data.status = 'agendado'
  } else if (!data.status) {
    data.status = 'rascunho'
  }

  const record = await pb.collection('posts').create(data)

  if (data.agendamento_tipo === 'agora') {
    for (let i = 0; i < 15; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      try {
        const updated = await pb.collection('posts').getOne(record.id)
        if (updated.status === 'publicado') {
          return updated
        }
        if (updated.status === 'falhou') {
          throw new Error('Falha ao publicar. Verifique os campos ou a conexão com as redes.')
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('Falha ao publicar')) {
          throw err
        }
      }
    }
  }

  return record
}

export const createPostWithFiles = async (data: any, files: File[]) => {
  const formData = new FormData()

  if (data.agendamento_tipo === 'agora') {
    data.status = 'agendado'
    data.agendado_para = new Date().toISOString()
  } else if (data.agendamento_tipo === 'depois') {
    data.status = 'agendado'
  } else if (!data.status) {
    data.status = 'rascunho'
  }

  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      if (key === 'redes_sociais') {
        formData.append(key, JSON.stringify(data[key]))
      } else if (data[key] instanceof Date) {
        formData.append(key, data[key].toISOString())
      } else {
        formData.append(key, String(data[key]))
      }
    }
  }

  files.forEach((file) => {
    formData.append('imagens', file)
  })

  const record = await pb.collection('posts').create(formData)

  if (data.agendamento_tipo === 'agora') {
    for (let i = 0; i < 15; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      try {
        const updated = await pb.collection('posts').getOne(record.id)
        if (updated.status === 'publicado') {
          return updated
        }
        if (updated.status === 'falhou') {
          throw new Error('Falha ao publicar. Verifique os campos ou a conexão com as redes.')
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('Falha ao publicar')) {
          throw err
        }
      }
    }
    throw new Error(
      'O tempo limite para publicação expirou, mas o processo continua em segundo plano.',
    )
  }

  return record
}

export const getABTests = async () => {
  return pb.collection('ab_tests').getFullList({
    expand: 'post_id_a,post_id_b',
    sort: '-created',
  })
}

export const createABTest = async (data: any) => {
  return pb.collection('ab_tests').create(data)
}

export const updateABTest = async (id: string, data: any) => {
  return pb.collection('ab_tests').update(id, data)
}

export const getRecommendations = async (testId: string) => {
  return pb.collection('recomendacoes').getFullList({
    filter: `teste_ab_id = "${testId}"`,
    sort: '-created',
  })
}

export const getPublishedPosts = async () => {
  return pb.collection('posts').getFullList({
    filter: `status = 'publicado'`,
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

export const getComments = async (postId: string) => {
  return pb.collection('comentarios').getFullList({
    filter: `post_id = "${postId}"`,
    expand: 'usuario_id',
    sort: 'created',
  })
}

export const createComment = async (data: any) => {
  return pb.collection('comentarios').create(data)
}

export const deleteComment = async (id: string) => {
  return pb.collection('comentarios').delete(id)
}

export const getActivities = async (filterStr = '') => {
  return pb.collection('atividades').getFullList({
    filter: filterStr,
    expand: 'usuario_id',
    sort: '-created',
  })
}

export const updatePostApproval = async (id: string, status: string) => {
  return pb.collection('posts').update(id, { status_aprovacao: status })
}

export const getAllNotifications = async (filterStr = '') => {
  return pb.collection('notifications').getFullList({
    filter: filterStr,
    expand: 'usuario_id',
    sort: '-created',
  })
}

export const markAllNotificationsRead = async () => {
  const unread = await getUnreadNotifications()
  await Promise.all(unread.map((n) => markNotificationRead(n.id)))
}

export const deleteNotification = async (id: string) => {
  return pb.collection('notifications').delete(id)
}

export const getCompanyUsers = async () => {
  const user = pb.authStore.record
  if (!user) return []
  return pb.collection('users').getFullList({
    filter: `empresa_id = "${user.empresa_id}"`,
  })
}
