migrate(
  (app) => {
    const collectionsToPurge = [
      // Level 1: Child records that reference posts or other primary entities
      'metrics_posts',
      'comentarios',
      'posts_monitorados',
      'recomendacoes',
      'webhook_logs',
      'oportunidades',

      // Level 2: Primary entities (posts, tests, webhooks, monitoring)
      'ab_tests',
      'posts',
      'monitoring',
      'webhooks',

      // Level 3: Company and user related independent records
      'notifications',
      'integracao_redes',
      'mensagens_diretas',
      'preferencias_usuario',
      'atividades',
      'mensagens_prontas',
      'automacoes',
      'backups',
      'configuracao_backup',
      'categorias_posts',
      'tags',
    ]

    // Purge standard collections
    for (let i = 0; i < collectionsToPurge.length; i++) {
      const tableName = collectionsToPurge[i]
      if (app.hasTable(tableName)) {
        try {
          app
            .db()
            .newQuery('DELETE FROM `' + tableName + '`')
            .execute()
        } catch (err) {
          console.log('Failed to purge ' + tableName + ':', err)
        }
      }
    }

    // Purge companies but preserve those linked to existing users
    if (app.hasTable('companies') && app.hasTable('users')) {
      try {
        app
          .db()
          .newQuery(`
        DELETE FROM \`companies\` 
        WHERE id NOT IN (
          SELECT empresa_id FROM \`users\` WHERE empresa_id IS NOT NULL AND empresa_id != ''
        )
      `)
          .execute()
      } catch (err) {
        console.log('Failed to purge companies:', err)
      }
    }
  },
  (app) => {
    // Down migration is intentionally empty as data deletion is irreversible
  },
)
