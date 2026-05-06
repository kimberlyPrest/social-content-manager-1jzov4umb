migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'eduardo@supremoaroma.com.br')
    } catch (_) {}

    let empresaId = ''
    if (user && user.getString('empresa_id')) {
      empresaId = user.getString('empresa_id')
    } else {
      try {
        const supremo = app.findFirstRecordByData('empresas', 'nome', 'Supremo Aroma')
        empresaId = supremo.id
      } catch (_) {
        try {
          const supremo = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
          empresaId = supremo.id
        } catch (_) {}
      }
    }

    if (!empresaId) return

    try {
      app.findFirstRecordByData('webhooks', 'url', 'https://seu-servidor.com/webhooks/posts')
    } catch (_) {
      const webhooks = app.findCollectionByNameOrId('webhooks')

      const w1 = new Record(webhooks)
      w1.set('empresa_id', empresaId)
      w1.set('url', 'https://seu-servidor.com/webhooks/posts')
      w1.set('eventos', ['post_publicado'])
      w1.set('ativo', true)
      app.save(w1)

      const w2 = new Record(webhooks)
      w2.set('empresa_id', empresaId)
      w2.set('url', 'https://seu-servidor.com/webhooks/comentarios')
      w2.set('eventos', ['novo_comentario'])
      w2.set('ativo', false)
      app.save(w2)
    }
  },
  (app) => {
    try {
      const w1 = app.findFirstRecordByData(
        'webhooks',
        'url',
        'https://seu-servidor.com/webhooks/posts',
      )
      app.delete(w1)
    } catch (_) {}
    try {
      const w2 = app.findFirstRecordByData(
        'webhooks',
        'url',
        'https://seu-servidor.com/webhooks/comentarios',
      )
      app.delete(w2)
    } catch (_) {}
  },
)
