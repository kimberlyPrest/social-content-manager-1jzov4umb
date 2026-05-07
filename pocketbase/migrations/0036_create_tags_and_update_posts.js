migrate(
  (app) => {
    const tagsCollection = new Collection({
      name: 'tags',
      type: 'base',
      listRule: 'empresa_id = @request.auth.empresa_id',
      viewRule: 'empresa_id = @request.auth.empresa_id',
      createRule: 'empresa_id = @request.auth.empresa_id',
      updateRule: 'empresa_id = @request.auth.empresa_id',
      deleteRule: 'empresa_id = @request.auth.empresa_id',
      fields: [
        { name: 'nome', type: 'text', required: true },
        {
          name: 'empresa_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tagsCollection)

    const postsCol = app.findCollectionByNameOrId('posts')
    if (!postsCol.fields.getByName('categoria_id')) {
      postsCol.fields.add(
        new RelationField({
          name: 'categoria_id',
          collectionId: app.findCollectionByNameOrId('categorias_posts').id,
          maxSelect: 1,
        }),
      )
    }
    if (!postsCol.fields.getByName('tags_list')) {
      postsCol.fields.add(new JSONField({ name: 'tags_list' }))
    }

    postsCol.addIndex('idx_posts_categoria', false, 'categoria_id', '')
    app.save(postsCol)
  },
  (app) => {
    const postsCol = app.findCollectionByNameOrId('posts')
    postsCol.removeIndex('idx_posts_categoria')
    postsCol.fields.removeByName('categoria_id')
    postsCol.fields.removeByName('tags_list')
    app.save(postsCol)

    const tagsCollection = app.findCollectionByNameOrId('tags')
    app.delete(tagsCollection)
  },
)
