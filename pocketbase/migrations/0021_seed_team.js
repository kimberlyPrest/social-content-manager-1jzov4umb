migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const companies = app.findCollectionByNameOrId('companies')

    let defaultCompany
    try {
      defaultCompany = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
    } catch (_) {
      const compRecord = new Record(companies)
      compRecord.set('nome', 'Supremo Aroma')
      app.save(compRecord)
      defaultCompany = compRecord
    }

    const seedUsers = [
      {
        email: 'ana@supremoaroma.com',
        name: 'Ana Silva',
        bday: '1990-04-25 12:00:00.000Z',
        role: 'admin',
        photo: 'https://img.usecurling.com/ppl/large?gender=female&seed=1',
      },
      {
        email: 'carlos@supremoaroma.com',
        name: 'Carlos Oliveira',
        bday: '1995-08-12 12:00:00.000Z',
        role: 'criador',
        photo: 'https://img.usecurling.com/ppl/large?gender=male&seed=2',
      },
      {
        email: 'mariana@supremoaroma.com',
        name: 'Mariana Santos',
        bday: '1992-11-03 12:00:00.000Z',
        role: 'analista',
        photo: 'https://img.usecurling.com/ppl/large?gender=female&seed=3',
      },
      {
        email: 'eduardo@supremoaroma.com',
        name: 'Eduardo Cássio',
        bday: '1988-06-15 12:00:00.000Z',
        role: 'master',
        photo: 'https://img.usecurling.com/ppl/large?gender=male&seed=4',
      },
    ]

    for (const u of seedUsers) {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', u.email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(u.email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', u.name)
        record.set('data_nascimento', u.bday)
        record.set('role', u.role)
        record.set('empresa_id', defaultCompany.id)
        record.set('foto_url', u.photo)
        record.set('ativo', true)
        app.save(record)
      }
    }

    try {
      const existingEduardo = app.findAuthRecordByEmail(
        '_pb_users_auth_',
        'eduardo@supremoaroma.com.br',
      )
      existingEduardo.set('role', 'master')
      existingEduardo.set('data_nascimento', '1988-06-15 12:00:00.000Z')
      app.save(existingEduardo)
    } catch (_) {}
  },
  (app) => {
    const emails = [
      'ana@supremoaroma.com',
      'carlos@supremoaroma.com',
      'mariana@supremoaroma.com',
      'eduardo@supremoaroma.com',
    ]
    for (const email of emails) {
      try {
        const rec = app.findAuthRecordByEmail('_pb_users_auth_', email)
        app.delete(rec)
      } catch (_) {}
    }
  },
)
