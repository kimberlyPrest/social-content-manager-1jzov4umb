migrate(
  (app) => {
    let companyId = ''

    const totalCompanies = app.countRecords('companies')

    if (totalCompanies > 0) {
      const records = app.findRecordsByFilter('companies', '1=1', '', 1, 0)
      companyId = records[0].id
    } else {
      const companies = app.findCollectionByNameOrId('companies')
      const newCompany = new Record(companies)
      newCompany.set('nome', 'Supremo Aroma')
      app.save(newCompany)
      companyId = newCompany.id
    }

    try {
      const user = app.findAuthRecordByEmail('users', 'eduardo@supremoaroma.com.br')
      user.set('empresa_id', companyId)
      app.save(user)
    } catch (_) {
      // Ignore if user does not exist
    }
  },
  (app) => {
    // Down migration not strictly necessary as this restores data consistency
  },
)
