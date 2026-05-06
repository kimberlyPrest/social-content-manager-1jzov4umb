migrate(
  (app) => {
    const collectionsToClear = [
      'webhook_logs',
      'webhooks',
      'recomendacoes',
      'ab_tests',
      'posts_monitorados',
      'monitoring',
      'comentarios',
      'metrics_posts',
      'oportunidades',
      'atividades',
      'mensagens_prontas',
      'automacoes',
      'backups',
      'configuracao_backup',
      'preferencias_usuario',
      'notifications',
      'mensagens_diretas',
      'integracao_redes',
      'posts',
    ]

    for (const name of collectionsToClear) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.truncateCollection(col)
      } catch (err) {
        console.log(`Failed to truncate collection ${name}:`, err)
        try {
          app.db().newQuery(`DELETE FROM ${name}`).execute()
        } catch (err2) {
          console.log(`Fallback delete failed for ${name}:`, err2)
        }
      }
    }
  },
  (app) => {
    // This migration is data-destructive and cannot be reverted
  },
)
