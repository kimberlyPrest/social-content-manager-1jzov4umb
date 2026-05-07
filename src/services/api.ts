import pb from '@/lib/pocketbase/client'

export const syncMetrics = async () => {
  return pb.send('/backend/v1/metrics/sync', { method: 'POST' })
}

export const syncInstagramPosts = async () => {
  return pb.send('/backend/v1/instagram/sync-posts', { method: 'POST' })
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

  return record
}

export const publicarPost = async (postId: string, redesSelecionadas: string[]) => {
  console.log('🚀 Iniciando publicação do post:', postId, 'Redes:', redesSelecionadas)

  const post = await pb.collection('posts').getOne(postId, { expand: 'empresa_id' })
  console.log('📋 Dados do post:', post)

  const integracoes = await pb.collection('integracao_redes').getFullList({
    filter: `empresa_id = "${post.empresa_id}"`,
  })

  let hasError = false
  const errors: { rede: string; error: any; isAuthError?: boolean }[] = []

  for (const rede of redesSelecionadas) {
    console.log('📤 Publicando em:', rede)
    const integracao = integracoes.find((i) => i.rede_social === rede)

    if (!integracao || !integracao.access_token) {
      const err = new Error(`Token não encontrado para a rede ${rede}`)
      console.error('❌ Erro ao publicar em', rede, err)
      hasError = true
      errors.push({ rede, error: err })
      continue
    }

    console.log('🔑 Token lido para', rede)

    let endpoint = ''
    if (rede === 'facebook') endpoint = 'https://graph.facebook.com/v25.0/me/feed'
    else if (rede === 'instagram') endpoint = 'https://graph.facebook.com/v25.0/me/media'
    else if (rede === 'linkedin') endpoint = 'https://api.linkedin.com/v2/ugcPosts'
    else if (rede === 'tiktok') endpoint = 'https://open.tiktokapis.com/v2/post/publish/video/init/'

    console.log('🌐 Chamando API:', endpoint)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${integracao.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: post.conteudo }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error(
            `❌ Erro de autenticação (401) ao publicar em ${rede}. Atualizando status da integração para expirado.`,
          )
          await pb.collection('integracao_redes').update(integracao.id, { status: 'expirado' })
          const err = new Error(`API error: ${response.status} ${response.statusText}`)
          hasError = true
          errors.push({ rede, error: err, isAuthError: true })
          continue
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Resposta da API:', data)
    } catch (error) {
      console.error('❌ Erro ao publicar em', rede, error)
      hasError = true
      errors.push({ rede, error })
    }
  }

  if (!hasError) {
    await pb.collection('posts').update(postId, {
      status: 'publicado',
      publicado_em: new Date().toISOString(),
    })
    console.log('✅ Post publicado com sucesso!')
  } else {
    await pb.collection('posts').update(postId, {
      status: 'falhou',
    })
  }

  return { success: !hasError, errors }
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
