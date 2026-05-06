migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let user
    try {
      user = app.findFirstRecordByData('_pb_users_auth_', 'email', 'eduardo@supremoaroma.com.br')
    } catch (_) {
      return
    }
    const empresaId = user.get('empresa_id')
    const integracoesCol = app.findCollectionByNameOrId('integracao_redes')

    const seed = [
      {
        rede_social: 'facebook',
        status: 'conectado',
        access_token: 'mock_token_facebook',
        created: '2026-04-15 10:00:00.000Z',
      },
      {
        rede_social: 'instagram',
        status: 'conectado',
        access_token: 'mock_token_instagram',
        created: '2026-04-20 10:00:00.000Z',
      },
      {
        rede_social: 'linkedin',
        status: 'desconectado',
        access_token: '',
        created: '2026-04-01 10:00:00.000Z',
      },
      {
        rede_social: 'tiktok',
        status: 'expirado',
        access_token: 'mock_token_tiktok',
        data_expiracao: '2026-04-25 10:00:00.000Z',
        created: '2026-03-01 10:00:00.000Z',
      },
    ]

    for (const item of seed) {
      let existing
      try {
        existing = app.findFirstRecordByFilter(
          'integracao_redes',
          `empresa_id="${empresaId}" && rede_social="${item.rede_social}"`,
        )
      } catch (_) {}

      if (existing) {
        existing.set('status', item.status)
        existing.set('access_token', item.access_token)
        if (item.data_expiracao) existing.set('data_expiracao', item.data_expiracao)
        app.saveNoValidate(existing)

        if (item.created) {
          app
            .db()
            .newQuery('UPDATE integracao_redes SET created={:created} WHERE id={:id}')
            .bind({ created: item.created, id: existing.id })
            .execute()
        }
      } else {
        const r = new Record(integracoesCol)
        r.set('empresa_id', empresaId)
        r.set('rede_social', item.rede_social)
        r.set('access_token', item.access_token)
        r.set('status', item.status)
        if (item.data_expiracao) r.set('data_expiracao', item.data_expiracao)
        app.saveNoValidate(r)

        if (item.created) {
          app
            .db()
            .newQuery('UPDATE integracao_redes SET created={:created} WHERE id={:id}')
            .bind({ created: item.created, id: r.id })
            .execute()
        }
      }
    }
  },
  (app) => {
    // down migration
  },
)
