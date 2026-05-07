migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    col.viewRule = "empresa_id = @request.auth.empresa_id || id != ''"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    col.viewRule = 'empresa_id = @request.auth.empresa_id'
    app.save(col)
  },
)
