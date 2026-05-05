migrate(
  (app) => {
    // Complete cleanup of old user/company data to prevent conflicts
    try {
      app.truncateCollection(app.findCollectionByNameOrId('notifications'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('monitoring'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('ab_tests'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('metrics_posts'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('posts'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('_pb_users_auth_'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('companies'))
    } catch (_) {}

    const companies = app.findCollectionByNameOrId('companies')
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Create new Supremo Aroma company
    const company = new Record(companies)
    company.set('nome', 'Supremo Aroma')
    app.save(company)

    // Insert 3 new users
    const seedUsers = [
      { email: 'admin@supremoaroma.com', name: 'Admin Supremo', role: 'admin' },
      { email: 'criador@supremoaroma.com', name: 'Carlos Oliveira', role: 'criador' },
      { email: 'analista@supremoaroma.com', name: 'Mariana Santos', role: 'analista' },
    ]

    for (const u of seedUsers) {
      const user = new Record(users)
      user.setEmail(u.email)
      user.setPassword('1215046bb')
      user.setVerified(true)
      user.set('name', u.name)
      user.set('role', u.role)
      user.set('empresa_id', company.id)
      user.set('ativo', true)
      app.save(user)
    }
  },
  (app) => {
    try {
      app.truncateCollection(app.findCollectionByNameOrId('_pb_users_auth_'))
    } catch (_) {}
    try {
      app.truncateCollection(app.findCollectionByNameOrId('companies'))
    } catch (_) {}
  },
)
