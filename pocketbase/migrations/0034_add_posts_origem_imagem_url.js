migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    if (!col.fields.getByName('origem')) {
      col.fields.add(
        new SelectField({
          name: 'origem',
          values: ['sistema', 'importado'],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('imagem_url')) {
      col.fields.add(new TextField({ name: 'imagem_url' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('posts')
    if (col.fields.getByName('origem')) col.fields.removeByName('origem')
    if (col.fields.getByName('imagem_url')) col.fields.removeByName('imagem_url')
    app.save(col)
  },
)
