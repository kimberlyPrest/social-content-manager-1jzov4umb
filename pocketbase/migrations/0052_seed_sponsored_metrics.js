migrate(
  (app) => {
    try {
      app.findFirstRecordByData('sponsored_metrics', 'site_name', 'Supremo Aroma Campaign')
      return // already seeded
    } catch (_) {}

    try {
      let company
      try {
        company = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
      } catch (_) {
        const allCompanies = app.findRecordsByFilter('companies', "id != ''", '', 1, 0)
        if (allCompanies.length > 0) company = allCompanies[0]
      }

      if (!company) return

      const collection = app.findCollectionByNameOrId('sponsored_metrics')
      const record = new Record(collection)

      record.set('empresa_id', company.id)
      record.set('site_name', 'Supremo Aroma Campaign')
      record.set('metrics', [
        { metric_name: 'Investimento', value: 1250.0, trend: 'estável', trend_percentage: 0 },
        { metric_name: 'Conversões', value: 85, trend: 'subindo', trend_percentage: 12 },
        { metric_name: 'Cliques', value: 4320, trend: 'subindo', trend_percentage: 5 },
        { metric_name: 'CPC', value: 0.28, trend: 'descendo', trend_percentage: 3 },
      ])

      app.save(record)
    } catch (e) {
      console.log('Failed to seed sponsored_metrics: ', e)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData(
        'sponsored_metrics',
        'site_name',
        'Supremo Aroma Campaign',
      )
      app.delete(record)
    } catch (_) {}
  },
)
