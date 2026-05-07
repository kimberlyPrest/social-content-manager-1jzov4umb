migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    const field = col.fields.getByName('imagens')

    if (field) {
      field.mimeTypes = ['image/jpeg', 'image/png', 'image/webp']
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    const field = col.fields.getByName('imagens')

    if (field) {
      field.mimeTypes = ['image/jpeg', 'image/png']
      app.save(col)
    }
  },
)
