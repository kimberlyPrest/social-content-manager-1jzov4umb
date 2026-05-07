routerAdd(
  'POST',
  '/backend/v1/instagram/sync-posts',
  (e) => {
    const auth = e.auth
    if (!auth) return e.json(401, { ok: false, motivo: 'Não autenticado' })

    const empresaId = auth.getString('empresa_id')
    const userId = auth.id

    const token = $secrets.get('INSTAGRAM_API_KEY')
    if (!token) return e.json(400, { ok: false, motivo: 'INSTAGRAM_API_KEY ausente' })

    let igId = ''
    try {
      const company = $app.findRecordById('companies', empresaId)
      igId = company.getString('instagram_business_id')
    } catch (_) {}
    if (!igId) igId = $secrets.get('INSTAGRAM_ID')
    if (!igId)
      return e.json(400, {
        ok: false,
        motivo: 'Instagram Business Account ID não configurado para esta empresa.',
      })

    let imported = 0
    let skipped = 0
    let cursor = null
    let hasMore = true

    while (hasMore) {
      let url = `https://graph.facebook.com/v25.0/${igId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count&access_token=${token}&limit=25`
      if (cursor) url += `&after=${cursor}`

      let res
      try {
        res = $http.send({ url, method: 'GET', timeout: 30 })
      } catch (err) {
        return e.json(500, {
          ok: false,
          motivo: 'Falha ao conectar com a API do Instagram',
          erro: err.message,
        })
      }

      if (res.statusCode !== 200) {
        return e.json(res.statusCode, {
          ok: false,
          motivo: 'Erro ao buscar mídia do Instagram',
          resposta: res.json,
        })
      }

      const body = res.json || {}
      const items = body.data || []

      for (const item of items) {
        let exists = false
        try {
          $app.findFirstRecordByFilter('posts', 'id_externo_instagram = {:igId}', { igId: item.id })
          exists = true
        } catch (_) {}

        if (exists) {
          skipped++
          continue
        }

        const caption = item.caption || ''
        const firstLine = caption.split('\n')[0] || ''
        let titulo = firstLine.length > 100 ? firstLine.substring(0, 97) + '...' : firstLine
        if (!titulo) {
          titulo = `Post Instagram ${new Date(item.timestamp).toLocaleDateString('pt-BR')}`
        }

        const imageUrl = item.media_url || item.thumbnail_url || ''
        const publishedAt = new Date(item.timestamp).toISOString().replace('T', ' ')

        const postsCol = $app.findCollectionByNameOrId('posts')
        const record = new Record(postsCol)
        record.set('empresa_id', empresaId)
        record.set('criador_id', userId)
        record.set('titulo', titulo)
        record.set('conteudo', caption)
        record.set('redes_sociais', JSON.stringify(['instagram']))
        record.set('status', 'publicado')
        record.set('publicado_em', publishedAt)
        record.set('id_externo_instagram', item.id)
        record.set('origem', 'importado')
        record.set('imagem_url', imageUrl)
        $app.saveNoValidate(record)

        let curtidas = item.like_count || 0
        let comentarios = item.comments_count || 0
        let impressoes = 0
        let alcance = 0

        try {
          const insightsRes = $http.send({
            url: `https://graph.facebook.com/v25.0/${item.id}/insights?metric=impressions,reach,saved&access_token=${token}`,
            method: 'GET',
            timeout: 10,
          })
          if (insightsRes.statusCode === 200 && insightsRes.json && insightsRes.json.data) {
            for (const metric of insightsRes.json.data) {
              const val = (metric.values && metric.values[0] && metric.values[0].value) || 0
              if (metric.name === 'impressions') impressoes = val
              if (metric.name === 'reach') alcance = val
            }
          }
        } catch (_) {}

        try {
          const metricsCol = $app.findCollectionByNameOrId('metrics_posts')
          const metricRecord = new Record(metricsCol)
          metricRecord.set('post_id', record.id)
          metricRecord.set('rede_social', 'instagram')
          metricRecord.set('curtidas', curtidas)
          metricRecord.set('comentarios', comentarios)
          metricRecord.set('impressoes', impressoes)
          metricRecord.set('alcance', alcance)
          metricRecord.set('atualizado_em', new Date().toISOString())
          $app.saveNoValidate(metricRecord)
        } catch (_) {}

        imported++
      }

      cursor = body.paging && body.paging.cursors && body.paging.cursors.after
      hasMore = !!(body.paging && body.paging.next) && !!cursor
    }

    return e.json(200, { ok: true, imported, skipped })
  },
  $apis.requireAuth(),
)
