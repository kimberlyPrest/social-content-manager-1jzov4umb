routerAdd(
  'POST',
  '/backend/v1/ai/generate-campaign',
  (e) => {
    const body = e.requestInfo().body || {}
    const titles = body.titles || []
    const networks = body.networks || []
    const bestDays = body.bestDays || [1, 4]

    if (titles.length === 0) {
      throw new BadRequestError('Selecione pelo menos 1 título.')
    }

    let empresaId = ''
    let userId = e.auth.id

    try {
      const user = $app.findRecordById('users', userId)
      empresaId = user.get('empresa_id')
    } catch (err) {
      throw new BadRequestError('Usuário não encontrado.')
    }

    const today = new Date()

    const getNextDay = (date, dayOfWeek) => {
      const resultDate = new Date(date.getTime())
      resultDate.setDate(date.getDate() + ((7 + dayOfWeek - date.getDay()) % 7))
      if (resultDate.getDate() === date.getDate() && date.getHours() >= 10) {
        resultDate.setDate(resultDate.getDate() + 7)
      }
      resultDate.setHours(10, 0, 0, 0)
      return resultDate
    }

    const scheduleDates = []
    for (let i = 0; i < titles.length; i++) {
      const baseDay = bestDays[i % bestDays.length] || 1
      const d = getNextDay(today, baseDay)
      const weekOffset = Math.floor(i / (bestDays.length || 1))
      d.setDate(d.getDate() + weekOffset * 7)
      scheduleDates.push(d)
    }

    // Shift duplicates
    for (let i = 1; i < scheduleDates.length; i++) {
      for (let j = 0; j < i; j++) {
        if (scheduleDates[i].getTime() === scheduleDates[j].getTime()) {
          scheduleDates[i].setDate(scheduleDates[i].getDate() + 1)
        }
      }
    }

    $app.runInTransaction((txApp) => {
      const postsCol = txApp.findCollectionByNameOrId('posts')
      const metricsCol = txApp.findCollectionByNameOrId('metrics_posts')

      for (let i = 0; i < titles.length; i++) {
        const title = titles[i]
        const blogDate = scheduleDates[i]

        const blogPost = new Record(postsCol)
        blogPost.set('empresa_id', empresaId)
        blogPost.set('criador_id', userId)
        blogPost.set('titulo', title)
        blogPost.set(
          'conteudo',
          `Escreva aqui o conteúdo aprofundado para o artigo de blog sobre: ${title}`,
        )
        blogPost.set('redes_sociais', ['blog'])
        blogPost.set('status', 'agendado')
        blogPost.set('agendado_para', blogDate.toISOString())
        blogPost.set('tags_list', JSON.stringify(['Automated', 'Blog']))
        txApp.save(blogPost)

        const blogMetrics = new Record(metricsCol)
        blogMetrics.set('post_id', blogPost.id)
        blogMetrics.set('rede_social', 'blog')
        blogMetrics.set('curtidas', 0)
        blogMetrics.set('comentarios', 0)
        blogMetrics.set('compartilhamentos', 0)
        blogMetrics.set('alcance', 0)
        txApp.save(blogMetrics)

        for (const network of networks) {
          if (network === 'blog') continue
          for (let j = 0; j < 2; j++) {
            const socialDate = new Date(blogDate.getTime())
            socialDate.setDate(socialDate.getDate() + j + 1)
            socialDate.setHours(14 + j, 30, 0, 0)

            const socialPost = new Record(postsCol)
            socialPost.set('empresa_id', empresaId)
            socialPost.set('criador_id', userId)
            socialPost.set(
              'titulo',
              `[${network.charAt(0).toUpperCase() + network.slice(1)}] Variação ${j + 1} - ${title.substring(0, 20)}...`,
            )
            socialPost.set(
              'conteudo',
              `Confira nosso novo artigo sobre ${title}! Você não vai acreditar no que descobrimos. Acesse o link na bio para ler completo. #${network} #Novidade #Blog`,
            )
            socialPost.set('redes_sociais', [network])
            socialPost.set('status', 'agendado')
            socialPost.set('agendado_para', socialDate.toISOString())
            socialPost.set('tags_list', JSON.stringify(['Automated', 'Social']))
            txApp.save(socialPost)

            const socialMetrics = new Record(metricsCol)
            socialMetrics.set('post_id', socialPost.id)
            socialMetrics.set('rede_social', network)
            socialMetrics.set('curtidas', 0)
            socialMetrics.set('comentarios', 0)
            socialMetrics.set('compartilhamentos', 0)
            socialMetrics.set('alcance', 0)
            txApp.save(socialMetrics)
          }
        }
      }
    })

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
