migrate(
  (app) => {
    let empresaId = null
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'eduardo@supremoaroma.com.br')
      empresaId = user.getString('empresa_id')
    } catch (_) {
      try {
        const companies = app.findRecordsByFilter('companies', '1=1', '', 1, 0)
        if (companies.length > 0) {
          empresaId = companies[0].id
        }
      } catch (_) {}
    }

    if (!empresaId) return

    const categoriasCol = app.findCollectionByNameOrId('categorias_posts')

    const categorias = [
      { nome: 'Institucional', cor: '#3b82f6' },
      { nome: 'Promocional', cor: '#ef4444' },
      { nome: 'Engajamento', cor: '#10b981' },
    ]

    for (const cat of categorias) {
      try {
        app.findFirstRecordByFilter(
          'categorias_posts',
          'nome = {:nome} && empresa_id = {:empresa_id}',
          { nome: cat.nome, empresa_id: empresaId },
        )
      } catch (_) {
        const record = new Record(categoriasCol)
        record.set('nome', cat.nome)
        record.set('cor', cat.cor)
        record.set('empresa_id', empresaId)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter(
        'categorias_posts',
        "nome = 'Institucional' || nome = 'Promocional' || nome = 'Engajamento'",
        '',
        100,
        0,
      )
      for (const record of records) {
        app.delete(record)
      }
    } catch (_) {}
  },
)
