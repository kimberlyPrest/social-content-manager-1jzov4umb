routerAdd(
  'GET',
  '/backend/v1/ai/titles',
  (e) => {
    const titles = [
      'As 5 Maiores Tendências de Marketing para 2024',
      'Como Aumentar o Engajamento nas Redes Sociais em 30 Dias',
      'Estratégias de Conteúdo que Realmente Convertem',
      'O Guia Definitivo para SEO em Blogs Corporativos',
      'Como Utilizar Dados para Guiar sua Criação de Conteúdo',
      'Construindo uma Marca Forte no Ambiente Digital',
      'Erros Comuns de Marketing e Como Evitá-los',
      'Maximizando o ROI das suas Campanhas de Mídia Social',
    ]
    return e.json(200, { titles })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/ai/campaign',
  (e) => {
    const body = e.requestInfo().body || {}
    const titles = body.titles || []
    const networks = body.networks || []
    const bestDays = body.bestDays || [1, 4]
    const empresaId = e.auth.getString('empresa_id')
    const userId = e.auth.id

    if (titles.length === 0) {
      return e.badRequestError('Selecione pelo menos 1 título.')
    }

    const getNextDate = (dayOfWeek, weekOffset) => {
      let d = new Date()
      d.setDate(d.getDate() + ((dayOfWeek + 7 - d.getDay()) % 7 || 7) + weekOffset * 7)
      d.setHours(10, 0, 0, 0)
      return d
    }

    const dates = titles.map((_, i) => {
      const dayOfWeek = bestDays[i % bestDays.length] || 1
      const weekOffset = Math.floor(i / (bestDays.length || 1))
      return getNextDate(dayOfWeek, weekOffset)
    })

    // Ensure no duplicate dates by shifting duplicates
    for (let i = 1; i < dates.length; i++) {
      for (let j = 0; j < i; j++) {
        if (dates[i].getTime() === dates[j].getTime()) {
          dates[i].setDate(dates[i].getDate() + 1)
        }
      }
    }

    const postsToSave = []

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i]
      const postDate = dates[i]

      // 1. Blog Post
      const blogPost = new Record($app.findCollectionByNameOrId('posts'))
      blogPost.set('empresa_id', empresaId)
      blogPost.set('criador_id', userId)
      blogPost.set('titulo', `[Blog] ${title}`)
      blogPost.set(
        'conteudo',
        `<h1>${title}</h1>\n\n<p>Este é um artigo completo gerado automaticamente para garantir padrões impecáveis de SEO.</p>\n\n<h2>Introdução</h2>\n<p>Descubra como aplicar as melhores estratégias no seu negócio hoje e transformar sua presença digital.</p>`,
      )
      blogPost.set('status', 'agendado')
      blogPost.set('agendado_para', postDate.toISOString().replace('T', ' '))
      blogPost.set('tags_list', JSON.stringify(['Automated', 'Blog']))
      blogPost.set('redes_sociais', JSON.stringify([]))
      postsToSave.push(blogPost)

      // 2. Derivative Social Posts
      for (const net of networks) {
        for (let j = 0; j < 2; j++) {
          const socialPost = new Record($app.findCollectionByNameOrId('posts'))
          socialPost.set('empresa_id', empresaId)
          socialPost.set('criador_id', userId)
          socialPost.set('titulo', `[Social] ${net} - ${title} (Derivado ${j + 1})`)
          socialPost.set(
            'conteudo',
            j === 0
              ? `💡 Você sabia? "${title}" é essencial para o seu negócio! \n\nConfira nosso novo artigo no blog! Link na bio. \n\n#SEO #Marketing #Dicas`
              : `🚀 Não perca nossas dicas sobre "${title}". \n\nLeia mais no blog hoje mesmo e transforme seus resultados! 👇 \n\n#Conteudo #Inovação`,
          )
          socialPost.set('status', 'agendado')

          // Spread social posts across the week
          const socialDate = new Date(postDate)
          socialDate.setDate(socialDate.getDate() + j + 1) // Next day and the day after
          socialDate.setHours(14 + j * 4, 0, 0, 0) // Diff hours (e.g. 14:00, 18:00)

          socialPost.set('agendado_para', socialDate.toISOString().replace('T', ' '))
          socialPost.set('redes_sociais', JSON.stringify([net]))
          socialPost.set('tags_list', JSON.stringify(['Automated', 'Social']))
          postsToSave.push(socialPost)
        }
      }
    }

    $app.runInTransaction((txApp) => {
      for (const p of postsToSave) {
        txApp.save(p)
      }
    })

    return e.json(200, { success: true, count: postsToSave.length })
  },
  $apis.requireAuth(),
)
