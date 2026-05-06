migrate(
  (app) => {
    let supremo
    try {
      supremo = app.findFirstRecordByData('empresas', 'nome', 'Supremo Aroma')
    } catch (_) {
      try {
        supremo = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
      } catch (_) {}
    }
    if (!supremo) return

    try {
      app.findFirstRecordByData('webhooks', 'url', 'https://seu-servidor.com/webhooks/posts')
    } catch (_) {
      const webhooks = app.findCollectionByNameOrId('webhooks')

      const w1 = new Record(webhooks)
      w1.set('empresa_id', supremo.id)
      w1.set('url', 'https://seu-servidor.com/webhooks/posts')
      w1.set('eventos', ['post_publicado'])
      w1.set('ativo', true)
      app.save(w1)

      const w2 = new Record(webhooks)
      w2.set('empresa_id', supremo.id)
      w2.set('url', 'https://seu-servidor.com/webhooks/comentarios')
      w2.set('eventos', ['novo_comentario'])
      w2.set('ativo', false)
      app.save(w2)
    }
  },
  (app) => {},
)
