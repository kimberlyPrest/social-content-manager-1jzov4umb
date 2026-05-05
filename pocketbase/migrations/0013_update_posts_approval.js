migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    if (!col.fields.getByName('status_aprovacao')) {
      col.fields.add(
        new SelectField({
          name: 'status_aprovacao',
          values: ['nenhum', 'aguardando_aprovacao', 'aprovado', 'rejeitado'],
          maxSelect: 1,
        }),
      )
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    if (col.fields.getByName('status_aprovacao')) {
      col.fields.removeByName('status_aprovacao')
      app.save(col)
    }
  },
)
