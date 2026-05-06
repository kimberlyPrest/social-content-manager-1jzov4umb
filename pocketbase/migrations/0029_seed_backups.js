migrate(
  (app) => {
    try {
      const comp = app.findFirstRecordByData('companies', 'nome', 'Supremo Aroma')
      if (!comp) return

      const configCol = app.findCollectionByNameOrId('configuracao_backup')
      const cfg = new Record(configCol)
      cfg.set('empresa_id', comp.id)
      cfg.set('ativo', true)
      cfg.set('frequencia', 'diaria')
      cfg.set('horario', '23:00')
      app.save(cfg)

      app
        .db()
        .newQuery(
          'INSERT INTO backups (id, empresa_id, tipo, arquivo_url, tamanho, status, created, updated) VALUES ({:id}, {:empresa_id}, {:tipo}, {:arquivo_url}, {:tamanho}, {:status}, {:created}, {:updated})',
        )
        .bind({
          id: 'mock_backup_001',
          empresa_id: comp.id,
          tipo: 'automatico',
          arquivo_url: 'backup_2026-05-15.json',
          tamanho: 2621440,
          status: 'sucesso',
          created: '2026-05-15 23:00:00.000Z',
          updated: '2026-05-15 23:00:00.000Z',
        })
        .execute()

      app
        .db()
        .newQuery(
          'INSERT INTO backups (id, empresa_id, tipo, arquivo_url, tamanho, status, created, updated) VALUES ({:id}, {:empresa_id}, {:tipo}, {:arquivo_url}, {:tamanho}, {:status}, {:created}, {:updated})',
        )
        .bind({
          id: 'mock_backup_002',
          empresa_id: comp.id,
          tipo: 'automatico',
          arquivo_url: 'backup_2026-05-14.json',
          tamanho: 2411724,
          status: 'sucesso',
          created: '2026-05-14 23:00:00.000Z',
          updated: '2026-05-14 23:00:00.000Z',
        })
        .execute()

      app
        .db()
        .newQuery(
          'INSERT INTO backups (id, empresa_id, tipo, arquivo_url, tamanho, status, created, updated) VALUES ({:id}, {:empresa_id}, {:tipo}, {:arquivo_url}, {:tamanho}, {:status}, {:created}, {:updated})',
        )
        .bind({
          id: 'mock_backup_003',
          empresa_id: comp.id,
          tipo: 'manual',
          arquivo_url: 'backup_2026-05-13.json',
          tamanho: 2202009,
          status: 'sucesso',
          created: '2026-05-13 14:30:00.000Z',
          updated: '2026-05-13 14:30:00.000Z',
        })
        .execute()
    } catch (err) {
      console.log('Seed failed or skipped', err)
    }
  },
  (app) => {
    try {
      app
        .db()
        .newQuery(
          "DELETE FROM backups WHERE id IN ('mock_backup_001', 'mock_backup_002', 'mock_backup_003')",
        )
        .execute()
      app.db().newQuery('DELETE FROM configuracao_backup').execute()
    } catch (e) {}
  },
)
