migrate(
  (app) => {
    let admin
    try {
      admin = app.findAuthRecordByEmail('users', 'eduardo@supremoaroma.com.br')
    } catch (e) {
      return
    }
    const empresa_id = admin.getString('empresa_id')
    if (!empresa_id) return

    // Clear existing integrations to match the exact mock data from the User Story
    app
      .db()
      .newQuery('DELETE FROM integracao_redes WHERE empresa_id = {:empresa}')
      .bind({ empresa: empresa_id })
      .execute()

    const query = `
    INSERT INTO integracao_redes (id, empresa_id, rede_social, status, access_token, created, updated, data_expiracao)
    VALUES 
    ({:id1}, {:empresa}, 'facebook', 'conectado', 'mock_token_fb', '2026-04-15 10:00:00.000Z', '2026-04-15 10:00:00.000Z', ''),
    ({:id2}, {:empresa}, 'instagram', 'conectado', 'mock_token_ig', '2026-04-20 10:00:00.000Z', '2026-04-20 10:00:00.000Z', ''),
    ({:id3}, {:empresa}, 'tiktok', 'expirado', 'mock_token_tk', '2026-04-10 10:00:00.000Z', '2026-06-05 10:00:00.000Z', '2026-06-05 10:00:00.000Z')
  `

    app
      .db()
      .newQuery(query)
      .bind({
        empresa: empresa_id,
        id1: $security.randomString(15),
        id2: $security.randomString(15),
        id3: $security.randomString(15),
      })
      .execute()
  },
  (app) => {
    let admin
    try {
      admin = app.findAuthRecordByEmail('users', 'eduardo@supremoaroma.com.br')
    } catch (e) {
      return
    }
    const empresa_id = admin.getString('empresa_id')
    if (!empresa_id) return

    app
      .db()
      .newQuery('DELETE FROM integracao_redes WHERE empresa_id = {:empresa}')
      .bind({ empresa: empresa_id })
      .execute()
  },
)
