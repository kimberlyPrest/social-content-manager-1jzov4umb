import pb from '@/lib/pocketbase/client'

export const getAITitles = async (theme: string) => {
  return pb.send('/backend/v1/ai/generate-titles', {
    method: 'POST',
    body: JSON.stringify({ theme }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const generateAICampaign = async (
  titles: string[],
  networks: string[],
  bestDays: number[],
) => {
  return pb.send('/backend/v1/ai/generate-campaign', {
    method: 'POST',
    body: JSON.stringify({ titles, networks, bestDays }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getBestPostingDays = async (empresaId?: string) => {
  try {
    const filter = empresaId ? `post_id.empresa_id = "${empresaId}"` : ''
    const metrics = await pb.collection('metrics_posts').getFullList({ filter, expand: 'post_id' })

    const dayScores = [0, 0, 0, 0, 0, 0, 0] // 0 = Sunday, 1 = Monday, ...
    metrics.forEach((m) => {
      const post = m.expand?.post_id as any
      const dateStr = post?.publicado_em || m.updated
      if (dateStr) {
        const d = new Date(dateStr).getDay()
        dayScores[d] += (m.curtidas || 0) + (m.comentarios || 0) + (m.compartilhamentos || 0)
      }
    })

    const sortedDays = dayScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
    if (sortedDays[0].score > 0) {
      return [sortedDays[0].index, sortedDays[1].index]
    }
  } catch (e) {
    console.error('Error calculating best days', e)
  }
  return [1, 4] // Default: Monday, Thursday
}

export const syncMetrics = async () => {
  return pb.send('/backend/v1/metrics/sync', { method: 'POST' })
}

export const syncInstagramPosts = async () => {
  return pb.send('/backend/v1/instagram/sync-posts', { method: 'POST' })
}

export const getDashboardData = async (days: number = 7, empresaId?: string) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const metricsFilter = [
    `updated >= "${startDate.toISOString().replace('T', ' ')}"`,
    empresaId ? `post_id.empresa_id = "${empresaId}"` : '',
  ]
    .filter(Boolean)
    .join(' && ')

  const metrics = await pb.collection('metrics_posts').getFullList({
    filter: metricsFilter,
    expand: 'post_id',
    sort: '+updated',
  })

  const postsFilter = empresaId ? `empresa_id = "${empresaId}"` : ''
  const posts = await pb.collection('posts').getFullList({
    filter: postsFilter,
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

export const getDashboardStats = async (empresaId?: string) => {
  const metrics = await pb.collection('metrics_posts').getFullList({
    filter: empresaId ? `post_id.empresa_id = "${empresaId}"` : '',
  })

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

export const getPosts = async (limit = 10, empresaId?: string) => {
  const filter = empresaId ? `empresa_id = "${empresaId}"` : ''
  return pb.collection('posts').getList(1, limit, {
    sort: '-created',
    expand: 'criador_id',
    filter,
  })
}

export const deletePost = async (id: string) => {
  try {
    const metrics = await pb
      .collection('metrics_posts')
      .getFullList({ filter: `post_id = "${id}"` })
    await Promise.all(metrics.map((m) => pb.collection('metrics_posts').delete(m.id)))

    const comments = await pb.collection('comentarios').getFullList({ filter: `post_id = "${id}"` })
    await Promise.all(comments.map((c) => pb.collection('comentarios').delete(c.id)))
  } catch (e) {
    console.error('Error cleaning up related records', e)
  }

  return pb.send(`/backend/v1/posts/${id}`, { method: 'DELETE' })
}

export const getPost = async (id: string) => {
  return pb.collection('posts').getOne(id, { expand: 'criador_id' })
}

export const getPostMetrics = async (postId: string) => {
  return pb.collection('metrics_posts').getFullList({
    filter: `post_id = "${postId}"`,
  })
}

export const updatePost = async (id: string, data: any) => {
  return pb.collection('posts').update(id, data)
}

export const updatePostWithFiles = async (id: string, data: any, files: File[]) => {
  const formData = new FormData()

  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      if (key === 'redes_sociais' || key === 'tags_list') {
        formData.append(key, JSON.stringify(data[key]))
      } else if (data[key] instanceof Date) {
        formData.append(key, data[key].toISOString())
      } else {
        formData.append(key, String(data[key]))
      }
    }
  }

  files.forEach((file) => {
    if (file.type.startsWith('video/')) {
      formData.append('videos', file)
    } else {
      formData.append('imagens', file)
    }
  })

  const record = await pb.collection('posts').update(id, formData)

  return record
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
      if (key === 'redes_sociais' || key === 'tags_list') {
        formData.append(key, JSON.stringify(data[key]))
      } else if (data[key] instanceof Date) {
        formData.append(key, data[key].toISOString())
      } else {
        formData.append(key, String(data[key]))
      }
    }
  }

  files.forEach((file) => {
    if (file.type.startsWith('video/')) {
      formData.append('videos', file)
    } else {
      formData.append('imagens', file)
    }
  })

  const record = await pb.collection('posts').create(formData)

  return record
}

export const getABTests = async (empresaId?: string) => {
  const filter = empresaId ? `empresa_id = "${empresaId}"` : ''
  return pb.collection('ab_tests').getFullList({
    expand: 'post_id_a,post_id_b',
    sort: '-created',
    filter,
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

export const getPublishedPosts = async (empresaId?: string) => {
  const filters = [`status = 'publicado'`]
  if (empresaId) filters.push(`empresa_id = "${empresaId}"`)
  return pb.collection('posts').getFullList({
    filter: filters.join(' && '),
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

export const getActivities = async (filterStr = '', empresaId?: string) => {
  const filters = []
  if (filterStr) filters.push(`(${filterStr})`)
  if (empresaId) filters.push(`empresa_id = "${empresaId}"`)

  return pb.collection('atividades').getFullList({
    filter: filters.join(' && '),
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

export const getCompanyUsers = async (empresaId?: string) => {
  const user = pb.authStore.record
  if (!user) return []
  const targetId = empresaId || user.empresa_id
  return pb.collection('users').getFullList({
    filter: `empresa_id = "${targetId}"`,
  })
}

export const getCategorias = async (empresaId?: string) => {
  const filter = empresaId ? `empresa_id = "${empresaId}"` : ''
  return pb.collection('categorias_posts').getFullList({ filter, sort: 'nome' })
}

export const getTags = async (empresaId?: string) => {
  const filter = empresaId ? `empresa_id = "${empresaId}"` : ''
  return pb.collection('tags').getFullList({ filter, sort: 'nome' })
}
