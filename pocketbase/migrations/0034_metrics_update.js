migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('metrics_posts')

    if (!col.fields.getByName('salvos')) {
      col.fields.add(new NumberField({ name: 'salvos' }))
    }
    if (!col.fields.getByName('visualizacoes_video')) {
      col.fields.add(new NumberField({ name: 'visualizacoes_video' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('metrics_posts')
    col.fields.removeByName('salvos')
    col.fields.removeByName('visualizacoes_video')
    app.save(col)
  },
)
