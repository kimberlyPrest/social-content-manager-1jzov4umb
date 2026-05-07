migrate(
  (app) => {
    const collections = [
      'metrics_posts',
      'comentarios',
      'recomendacoes',
      'ab_tests',
      'posts_monitorados',
      'oportunidades',
      'mensagens_diretas',
      'posts',
      'monitoring',
      'atividades',
      'automacoes',
      'mensagens_prontas',
      'webhook_logs',
      'webhooks',
      'backups',
      'configuracao_backup',
      'integracao_redes',
      'preferencias_usuario',
      'notifications',
      'categorias_posts',
      'tags',
      'companies',
    ]

    for (const name of collections) {
      try {
        app.db().newQuery(`DELETE FROM \`${name}\``).execute()
      } catch (e) {
        console.log(`Error deleting records from ${name}:`, e)
      }
    }
  },
  (app) => {
    // Down migration is intentionally left empty as data deletion cannot be reversed
  },
)
