migrate(
  (app) => {
    const posts = app.findCollectionByNameOrId('posts')
    posts.fields.add(new TextField({ name: 'id_externo_facebook' }))
    posts.fields.add(new TextField({ name: 'id_externo_instagram' }))

    const statusField = posts.fields.getByName('status')
    if (statusField) {
      statusField.values = ['rascunho', 'agendado', 'publicado', 'falhou', 'deletado']
    }
    app.save(posts)

    const metrics = app.findCollectionByNameOrId('metrics_posts')
    metrics.fields.add(new DateField({ name: 'atualizado_em' }))
    app.save(metrics)

    // Seed external IDs for published posts so user sees functionality without manual entry
    const publishedPosts = app.findRecordsByFilter('posts', "status = 'publicado'", '', 100, 0)
    for (const post of publishedPosts) {
      post.set('id_externo_instagram', 'mock_ig_' + post.id)
      app.save(post)
    }
  },
  (app) => {
    const posts = app.findCollectionByNameOrId('posts')
    posts.fields.removeByName('id_externo_facebook')
    posts.fields.removeByName('id_externo_instagram')

    const statusField = posts.fields.getByName('status')
    if (statusField) {
      statusField.values = ['rascunho', 'agendado', 'publicado', 'falhou']
    }
    app.save(posts)

    const metrics = app.findCollectionByNameOrId('metrics_posts')
    metrics.fields.removeByName('atualizado_em')
    app.save(metrics)
  },
)
