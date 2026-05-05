migrate(
  (app) => {
    let company
    try {
      company = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
    } catch (_) {
      return // Skip if company not found
    }

    const collection = app.findCollectionByNameOrId('integracao_redes')
    const redes = ['facebook', 'instagram', 'linkedin', 'tiktok']

    let existingRecords = []
    try {
      existingRecords = app.findRecordsByFilter(
        'integracao_redes',
        `empresa_id = '${company.id}'`,
        '',
        100,
        0,
      )
    } catch (_) {}

    const existingRedes = existingRecords.map((r) => r.getString('rede_social'))

    for (const rede of redes) {
      if (!existingRedes.includes(rede)) {
        const record = new Record(collection)
        record.set('empresa_id', company.id)
        record.set('rede_social', rede)
        record.set('access_token', 'mock_token_123')
        record.set('status', 'conectado')
        app.save(record)
      }
    }
  },
  (app) => {
    let company
    try {
      company = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
    } catch (_) {
      return
    }

    let existingRecords = []
    try {
      existingRecords = app.findRecordsByFilter(
        'integracao_redes',
        `empresa_id = '${company.id}'`,
        '',
        100,
        0,
      )
    } catch (_) {}

    for (const record of existingRecords) {
      app.delete(record)
    }
  },
)
