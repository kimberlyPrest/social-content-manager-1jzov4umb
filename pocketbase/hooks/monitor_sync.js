routerAdd(
  'POST',
  '/backend/v1/monitor/sync',
  (e) => {
    const auth = e.auth
    if (!auth) throw new UnauthorizedError('Unauthorized')
    const empresaId = auth.getString('empresa_id')

    const rules = $app.findRecordsByFilter(
      'monitoring',
      'empresa_id = {:empresaId} && ativo = true',
      '',
      0,
      0,
      { empresaId },
    )

    let totalFound = 0
    let hasError = false

    for (const rule of rules) {
      const redesStr = rule.getString('rede_social')
      const redes = redesStr ? redesStr.split(',').map((r) => r.trim().toLowerCase()) : []
      const valor = rule.getString('valor')

      for (const rede of redes) {
        $app.logger().info(`Busca iniciada para: ${valor} na rede ${rede}`)

        let res
        let foundPosts = []

        try {
          if (rede === 'facebook') {
            const token = $secrets.get('FACEBOOK_ACCESS_TOKEN')
            if (!token) {
              hasError = true
              $app.logger().info(`Resposta da API: 401`)
              continue
            }
            res = $http.send({
              url: `https://graph.facebook.com/v19.0/search?q=${encodeURIComponent(valor)}&type=post&access_token=${token}`,
              method: 'GET',
              timeout: 10,
            })
            $app.logger().info(`Resposta da API: ${res.statusCode}`)
            if (res.statusCode !== 200) {
              hasError = true
              continue
            }
            const items = res.json?.data || []
            foundPosts = items.map((item) => ({
              conteudo: item.message || item.story || '',
              autor: item.from?.name || 'Usuário Facebook',
              curtidas: 0,
              comentarios: 0,
              compartilhamentos: 0,
            }))
          } else if (rede === 'instagram') {
            const token = $secrets.get('INSTAGRAM_ACCESS_TOKEN')
            const userId = $secrets.get('INSTAGRAM_ID') || 'me'
            if (!token) {
              hasError = true
              $app.logger().info(`Resposta da API: 401`)
              continue
            }
            res = $http.send({
              url: `https://graph.facebook.com/v19.0/ig_hashtag_search?user_id=${userId}&q=${encodeURIComponent(valor)}&access_token=${token}`,
              method: 'GET',
              timeout: 10,
            })
            $app.logger().info(`Resposta da API: ${res.statusCode}`)
            if (res.statusCode !== 200) {
              hasError = true
              continue
            }
            const items = res.json?.data || []
            foundPosts = items.map((item) => ({
              conteudo: item.caption || '',
              autor: 'Usuário Instagram',
              curtidas: item.like_count || 0,
              comentarios: item.comments_count || 0,
              compartilhamentos: 0,
            }))
          } else if (rede === 'linkedin') {
            const token = $secrets.get('LINKEDIN_ACCESS_TOKEN')
            if (!token) {
              hasError = true
              $app.logger().info(`Resposta da API: 401`)
              continue
            }
            res = $http.send({
              url: `https://api.linkedin.com/v2/search?keywords=${encodeURIComponent(valor)}`,
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10,
            })
            $app.logger().info(`Resposta da API: ${res.statusCode}`)
            if (res.statusCode !== 200) {
              hasError = true
              continue
            }
            const items = res.json?.elements || []
            foundPosts = items.map((item) => ({
              conteudo: item.text || item.summary || '',
              autor: 'Usuário LinkedIn',
              curtidas: 0,
              comentarios: 0,
              compartilhamentos: 0,
            }))
          } else {
            $app.logger().info(`Resposta da API: 200`)
          }

          foundPosts = foundPosts.filter((p) => p.conteudo && p.conteudo.trim() !== '')
          $app.logger().info(`Total de posts encontrados: ${foundPosts.length}`)
          totalFound += foundPosts.length

          const col = $app.findCollectionByNameOrId('posts_monitorados')
          for (const p of foundPosts) {
            try {
              $app.findFirstRecordByFilter(
                'posts_monitorados',
                'monitoramento_id = {:ruleId} && rede_social = {:rede} && conteudo = {:conteudo}',
                '',
                { ruleId: rule.id, rede, conteudo: p.conteudo },
              )
              continue // exists
            } catch (_) {
              const rec = new Record(col)
              rec.set('empresa_id', empresaId)
              rec.set('monitoramento_id', rule.id)
              rec.set('autor', p.autor)
              rec.set('rede_social', rede)
              rec.set('conteudo', p.conteudo)
              rec.set('curtidas', p.curtidas)
              rec.set('comentarios', p.comentarios)
              rec.set('compartilhamentos', p.compartilhamentos)
              $app.save(rec)
            }
          }
        } catch (err) {
          $app.logger().error(`Erro ao buscar: ${err.message || String(err)}`)
          hasError = true
        }
      }
    }

    const values = rules.map((r) => r.getString('valor'))
    return e.json(200, { totalFound, hasError, rules: values })
  },
  $apis.requireAuth(),
)
