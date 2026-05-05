migrate(
  (app) => {
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'eduardo@supremoaroma.com.br')
    } catch (_) {
      return // skip seeding if admin doesn't exist
    }

    const empresaId = admin.get('empresa_id')

    const postsCol = app.findCollectionByNameOrId('posts')
    const abTestsCol = app.findCollectionByNameOrId('ab_tests')
    const recsCol = app.findCollectionByNameOrId('recomendacoes')

    try {
      app.findFirstRecordByData('ab_tests', 'status', 'ativo')
      return // Already seeded
    } catch (_) {}

    const createPost = (titulo) => {
      const p = new Record(postsCol)
      p.set('empresa_id', empresaId)
      p.set('criador_id', admin.id)
      p.set('titulo', titulo)
      p.set('status', 'publicado')
      app.save(p)
      return p
    }

    const p1a = createPost('Novo perfume')
    const p1b = createPost('Promoção especial')
    const p2a = createPost('Dica de uso')
    const p2b = createPost('Unboxing detalhado')
    const p3a = createPost('Entrevista com perfumista')
    const p3b = createPost('Behind the Scenes')

    const now = new Date()

    const createTest = (pa, pb, status, metric, days, winner) => {
      const t = new Record(abTestsCol)
      t.set('empresa_id', empresaId)
      t.set('post_id_a', pa.id)
      t.set('post_id_b', pb.id)
      t.set('status', status)
      t.set('metrica_principal', metric)
      t.set('dias_duracao', days)
      if (winner) t.set('vencedor', winner)

      const finalDate = new Date(now)
      finalDate.setDate(finalDate.getDate() + (status === 'ativo' ? Math.floor(days / 2) : -1))
      t.set('finalizado_em', finalDate.toISOString())

      app.save(t)
      return t
    }

    const t1 = createTest(p1a, p1b, 'ativo', 'likes', 14, '')
    const t2 = createTest(p2a, p2b, 'finalizado', 'engajamento', 7, 'b')
    const t3 = createTest(p3a, p3b, 'ativo', 'comentarios', 30, '')

    const createRec = (testId, tipo, msg) => {
      const r = new Record(recsCol)
      r.set('empresa_id', empresaId)
      r.set('teste_ab_id', testId)
      r.set('tipo', tipo)
      r.set('mensagem', msg)
      app.save(r)
    }

    createRec(t2.id, 'conteudo', "Posts estilo 'Unboxing' têm 35% mais retenção.")
    createRec(t2.id, 'horario', 'A audiência engajou mais à noite com o vencedor.')
    createRec(t1.id, 'performance', "O 'Novo perfume' está atraindo mais visualizações iniciais.")
  },
  (app) => {
    // Safe down
  },
)
