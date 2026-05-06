migrate(
  (app) => {
    const collection = new Collection({
      name: 'mensagens_prontas',
      type: 'base',
      listRule: 'empresa_id = @request.auth.empresa_id',
      viewRule: 'empresa_id = @request.auth.empresa_id',
      createRule: 'empresa_id = @request.auth.empresa_id',
      updateRule: 'empresa_id = @request.auth.empresa_id',
      deleteRule: 'empresa_id = @request.auth.empresa_id',
      fields: [
        {
          name: 'empresa_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'texto', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('mensagens_prontas')
      app.delete(collection)
    } catch (_) {}
  },
)
