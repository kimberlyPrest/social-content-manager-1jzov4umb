migrate(
  (app) => {
    const collection = new Collection({
      name: 'sponsored_metrics',
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
        { name: 'site_id', type: 'text' },
        { name: 'site_name', type: 'text', required: true },
        { name: 'site_url', type: 'url', exceptDomains: [], onlyDomains: [] },
        { name: 'metrics', type: 'json', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('sponsored_metrics')
    app.delete(collection)
  },
)
