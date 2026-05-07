migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    const field = col.fields.getByName('status')
    if (field) {
      field.values = ['rascunho', 'agendado', 'processando', 'publicado', 'falhou', 'deletado']
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    const field = col.fields.getByName('status')
    if (field) {
      field.values = ['rascunho', 'agendado', 'publicado', 'falhou', 'deletado']
      app.save(col)
    }
  },
)
