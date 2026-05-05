migrate(
  (app) => {
    // Complete cleanup of old user/company data to prevent conflicts
    app.db().newQuery('DELETE FROM notifications').execute()
    app.db().newQuery('DELETE FROM monitoring').execute()
    app.db().newQuery('DELETE FROM ab_tests').execute()
    app.db().newQuery('DELETE FROM metrics_posts').execute()
    app.db().newQuery('DELETE FROM posts').execute()
    app.db().newQuery('DELETE FROM _pb_users_auth_').execute()
    app.db().newQuery('DELETE FROM companies').execute()

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
    app.db().newQuery('DELETE FROM _pb_users_auth_').execute()
    app.db().newQuery('DELETE FROM companies').execute()
  },
)
