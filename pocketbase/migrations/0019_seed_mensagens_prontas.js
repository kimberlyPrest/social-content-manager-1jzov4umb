migrate(
  (app) => {
    const companies = app.findRecordsByFilter('companies', '1=1', '', 100, 0)
    const collection = app.findCollectionByNameOrId('mensagens_prontas')
    const messages = [
      'Aprovado ✓',
      'Precisa revisar',
      'Excelente conteúdo!',
      'Mudar título',
      'Adicionar imagem',
      'Reduzir texto',
    ]

    for (const company of companies) {
      for (const texto of messages) {
        try {
          app.findFirstRecordByFilter(
            'mensagens_prontas',
            `empresa_id = '${company.id}' && texto = '${texto}'`,
          )
        } catch (_) {
          const record = new Record(collection)
          record.set('empresa_id', company.id)
          record.set('texto', texto)
          app.save(record)
        }
      }
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter('mensagens_prontas', '1=1', '', 1000, 0)
      for (const record of records) {
        app.delete(record)
      }
    } catch (_) {}
  },
)
