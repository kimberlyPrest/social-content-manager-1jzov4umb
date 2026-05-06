migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'eduardo@supremoaroma.com.br')
      const empresa_id = admin.get('empresa_id')

      const integracoesCol = app.findCollectionByNameOrId('integracao_redes')

      const updateOrCreate = (rede, status, created, exp) => {
        try {
          const record = app.findFirstRecordByFilter(
            'integracao_redes',
            `empresa_id = '${empresa_id}' && rede_social = '${rede}'`,
          )
          record.set('status', status)
          if (created) record.set('created', created)
          if (exp) {
            record.set('data_expiracao', exp)
          } else {
            record.set('data_expiracao', '')
          }
          app.save(record)
        } catch (_) {
          const record = new Record(integracoesCol)
          record.set('empresa_id', empresa_id)
          record.set('rede_social', rede)
          record.set('access_token', `mock_token_${rede}`)
          record.set('status', status)
          if (created) record.set('created', created)
          if (exp) record.set('data_expiracao', exp)
          app.save(record)
        }
      }

      // Match exact acceptance criteria dates for mock data
      updateOrCreate('facebook', 'conectado', '2026-04-15T12:00:00.000Z', null)
      updateOrCreate('instagram', 'conectado', '2026-04-20T12:00:00.000Z', null)
      updateOrCreate('linkedin', 'desconectado', null, null)
      updateOrCreate('tiktok', 'expirado', '2026-04-10T12:00:00.000Z', '2026-06-05T12:00:00.000Z')
    } catch (e) {
      console.log('Admin or empresa not found, skipping seed.')
    }
  },
  (app) => {
    // Down migration - we don't strictly revert the seed to avoid deleting user integrations,
    // but if needed we could reset them here.
  },
)
