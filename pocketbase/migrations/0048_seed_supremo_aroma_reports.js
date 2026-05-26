migrate((app) => {
  let empresaId = null
  let adminId = null

  try {
    const admin = app.findFirstRecordByData('users', 'email', 'eduardo@supremoaroma.com.br')
    empresaId = admin.get('empresa_id')
    adminId = admin.id
  } catch (_) {
    try {
      const cmp = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
      empresaId = cmp.id
      const admin = app.findFirstRecordByData('users', 'empresa_id', empresaId)
      adminId = admin.id
    } catch (_) {}
  }

  if (!empresaId || !adminId) return

  const postsCol = app.findCollectionByNameOrId('posts')
  const metricsCol = app.findCollectionByNameOrId('metrics_posts')
  const now = new Date()

  const generateRealisticMetrics = (isBlog, network) => {
    let baseReach = isBlog ? 3000 : network === 'instagram' ? 5000 : 2000
    return {
      curtidas: Math.floor(baseReach * (Math.random() * 0.05 + 0.01)),
      comentarios: Math.floor(baseReach * (Math.random() * 0.02)),
      compartilhamentos: Math.floor(baseReach * (Math.random() * 0.01)),
      alcance: Math.floor(baseReach * (Math.random() * 0.4 + 0.8)),
      impressoes: Math.floor(baseReach * (Math.random() * 0.5 + 1.2)),
      cliques: Math.floor(baseReach * (Math.random() * 0.08 + 0.02)),
    }
  }

  app.runInTransaction((txApp) => {
    for (let i = 1; i <= 25; i++) {
      const isBlog = i % 4 === 0
      const network = isBlog
        ? 'blog'
        : i % 3 === 0
          ? 'linkedin'
          : i % 2 === 0
            ? 'facebook'
            : 'instagram'

      const postDate = new Date(now.getTime())
      postDate.setDate(now.getDate() - i)

      const post = new Record(postsCol)
      post.set('empresa_id', empresaId)
      post.set('criador_id', adminId)
      post.set(
        'titulo',
        isBlog
          ? `Como o Café Especial pode mudar seu dia (Edição ${i})`
          : `Descubra novos aromas com Supremo Aroma #${i}`,
      )
      post.set('conteudo', `Conteúdo dinâmico gerado para engajamento em ${network}`)
      post.set('redes_sociais', [network])
      post.set('status', 'publicado')
      post.set('publicado_em', postDate.toISOString())
      post.set('tags_list', JSON.stringify(['Automated', isBlog ? 'Blog' : 'Social']))
      txApp.save(post)

      const m = generateRealisticMetrics(isBlog, network)
      const metrics = new Record(metricsCol)
      metrics.set('post_id', post.id)
      metrics.set('rede_social', network)
      metrics.set('curtidas', m.curtidas)
      metrics.set('comentarios', m.comentarios)
      metrics.set('compartilhamentos', m.compartilhamentos)
      metrics.set('alcance', m.alcance)
      metrics.set('impressoes', m.impressoes)
      metrics.set('cliques', m.cliques)
      txApp.save(metrics)
    }
  })
})
