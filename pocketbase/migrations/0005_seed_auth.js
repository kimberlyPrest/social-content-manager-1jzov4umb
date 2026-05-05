migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    const companiesCol = app.findCollectionByNameOrId('companies')

    app.truncateCollection(usersCol)
    app.truncateCollection(companiesCol)

    const company = new Record(companiesCol)
    company.set('nome', 'Supremo Aroma')
    app.save(company)

    const usersData = [
      { email: 'admin@supremoaroma.com', name: 'Admin Supremo', role: 'admin' },
      { email: 'criador@supremoaroma.com', name: 'Carlos Oliveira', role: 'criador' },
      { email: 'analista@supremoaroma.com', name: 'Mariana Santos', role: 'analista' },
    ]

    for (const data of usersData) {
      const user = new Record(usersCol)
      user.setEmail(data.email)
      user.setPassword('1215046bb')
      user.setVerified(true)
      user.set('name', data.name)
      user.set('role', data.role)
      user.set('empresa_id', company.id)
      user.set('ativo', true)
      app.save(user)
    }
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    const companiesCol = app.findCollectionByNameOrId('companies')
    app.truncateCollection(usersCol)
    app.truncateCollection(companiesCol)
  },
)
