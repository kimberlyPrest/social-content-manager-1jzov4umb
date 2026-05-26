migrate(
  (app) => {
    let company
    try {
      company = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
    } catch (_) {
      console.log("Empresa 'Supremo Aroma' não encontrada.")
      return
    }

    const empresaId = company.id
    const integracoesCol = app.findCollectionByNameOrId('integracao_redes')

    const redes = [
      { nome: 'facebook', token: 'mock_fb_token_supremo' },
      { nome: 'instagram', token: 'mock_ig_token_supremo' },
      { nome: 'linkedin', token: 'mock_li_token_supremo' },
      { nome: 'tiktok', token: 'mock_tt_token_supremo' },
    ]

    for (const rede of redes) {
      let record
      try {
        record = app.findFirstRecordByFilter(
          'integracao_redes',
          'empresa_id = {:empresaId} && rede_social = {:rede}',
          '',
          { empresaId, rede: rede.nome },
        )
      } catch (_) {
        record = new Record(integracoesCol)
        record.set('empresa_id', empresaId)
        record.set('rede_social', rede.nome)
      }

      record.set('status', 'conectado')
      record.set('access_token', rede.token)
      record.set('data_expiracao', '2026-12-31 23:59:59.000Z')

      app.save(record)
    }
  },
  (app) => {
    let company
    try {
      company = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
    } catch (_) {
      return
    }

    const empresaId = company.id
    const redes = ['facebook', 'instagram', 'linkedin', 'tiktok']

    for (const rede of redes) {
      try {
        const record = app.findFirstRecordByFilter(
          'integracao_redes',
          'empresa_id = {:empresaId} && rede_social = {:rede}',
          '',
          { empresaId, rede },
        )
        app.delete(record)
      } catch (_) {}
    }
  },
)
