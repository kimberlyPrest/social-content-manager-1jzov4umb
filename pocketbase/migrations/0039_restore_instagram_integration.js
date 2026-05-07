migrate(
  (app) => {
    let company
    try {
      company = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
    } catch (_) {
      try {
        company = app.findFirstRecordByFilter('companies', '1=1')
      } catch (_) {}
    }

    if (!company) return

    const integracoes = app.findCollectionByNameOrId('integracao_redes')
    let existing
    try {
      existing = app.findFirstRecordByFilter(
        'integracao_redes',
        "empresa_id = {:empresa} && rede_social = 'instagram'",
        {
          empresa: company.id,
        },
      )
    } catch (_) {}

    if (existing) {
      existing.set('status', 'conectado')
      app.save(existing)
    } else {
      const record = new Record(integracoes)
      record.set('empresa_id', company.id)
      record.set('rede_social', 'instagram')
      record.set('status', 'conectado')
      record.set('access_token', '')

      const exp = new Date()
      exp.setDate(exp.getDate() + 365)
      record.set('data_expiracao', exp.toISOString().replace('T', ' '))

      app.save(record)
    }
  },
  (app) => {
    // down
  },
)
