migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    col.fields.add(new TextField({ name: 'api_key' }))
    col.addIndex('idx_companies_api_key', true, 'api_key', "api_key != ''")
    app.save(col)

    try {
      let company
      try {
        company = app.findFirstRecordByData('companies', 'id', 'supremo_aroma_id')
      } catch (_) {
        try {
          company = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
        } catch (__) {
          const records = app.findRecordsByFilter('companies', '1=1', 'created', 1, 0)
          if (records.length > 0) company = records[0]
        }
      }

      if (company) {
        const apiKey = 'sk_' + $security.randomString(32)
        company.set('api_key', apiKey)
        app.save(company)
      }
    } catch (err) {
      console.log('Error seeding API key:', err)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    col.removeIndex('idx_companies_api_key')
    col.fields.removeByName('api_key')
    app.save(col)
  },
)
