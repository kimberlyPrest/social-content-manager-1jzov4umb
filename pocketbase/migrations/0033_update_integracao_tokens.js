migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('integracao_redes')
    const field = col.fields.getByName('access_token')
    if (field) {
      field.required = false
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('integracao_redes')
    const field = col.fields.getByName('access_token')
    if (field) {
      field.required = true
      app.save(col)
    }
  },
)
