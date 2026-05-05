migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const posts = app.findCollectionByNameOrId('posts')
    const metrics = app.findCollectionByNameOrId('metrics_posts')

    // Create Company
    let company
    try {
      company = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
    } catch (_) {
      company = new Record(companies)
      company.set('nome', 'Supremo Aroma')
      app.save(company)
    }

    // Create Users
    const seedUsers = [
      { email: 'admin@supremoaroma.com.br', role: 'admin', name: 'Administrador Supremo' },
      { email: 'criador@supremoaroma.com.br', role: 'criador', name: 'Criador de Conteúdo' },
      { email: 'analista@supremoaroma.com.br', role: 'analista', name: 'Analista de Dados' },
    ]

    let creatorId
    for (const u of seedUsers) {
      try {
        const rec = app.findAuthRecordByEmail('_pb_users_auth_', u.email)
        if (u.role === 'criador') creatorId = rec.id
      } catch (_) {
        const rec = new Record(users)
        rec.setEmail(u.email)
        rec.setPassword('Skip@Pass')
        rec.setVerified(true)
        rec.set('name', u.name)
        rec.set('role', u.role)
        rec.set('empresa_id', company.id)
        rec.set('ativo', true)
        app.save(rec)
        if (u.role === 'criador') creatorId = rec.id
      }
    }

    // Create Post
    let post
    try {
      post = app.findFirstRecordByData('posts', 'titulo', 'Lançamento Café Gourmet')
    } catch (_) {
      post = new Record(posts)
      post.set('empresa_id', company.id)
      post.set('criador_id', creatorId)
      post.set('titulo', 'Lançamento Café Gourmet')
      post.set(
        'conteudo',
        'Experimente o nosso novo Café Gourmet. O sabor supremo para as suas manhãs!',
      )
      post.set('redes_sociais', ['instagram', 'facebook'])
      post.set('status', 'publicado')
      app.save(post)

      // Create Metrics
      const metric1 = new Record(metrics)
      metric1.set('post_id', post.id)
      metric1.set('rede_social', 'instagram')
      metric1.set('curtidas', 150)
      metric1.set('comentarios', 25)
      metric1.set('compartilhamentos', 10)
      metric1.set('alcance', 1200)
      metric1.set('impressoes', 1500)
      app.save(metric1)
    }
  },
  (app) => {
    // Try to revert
    try {
      const p = app.findFirstRecordByData('posts', 'titulo', 'Lançamento Café Gourmet')
      app.delete(p)
    } catch (_) {}
  },
)
