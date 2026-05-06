migrate(
  (app) => {
    const webhooks = new Collection({
      name: 'webhooks',
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
          collectionId: 'companies',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'url', type: 'url', required: true },
        { name: 'secret', type: 'text' },
        { name: 'eventos', type: 'json', required: true },
        { name: 'ativo', type: 'bool' },
        { name: 'ultimo_disparo', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(webhooks)

    const logs = new Collection({
      name: 'webhook_logs',
      type: 'base',
      listRule: 'webhook_id.empresa_id = @request.auth.empresa_id',
      viewRule: 'webhook_id.empresa_id = @request.auth.empresa_id',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'webhook_id',
          type: 'relation',
          required: true,
          collectionId: webhooks.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'evento', type: 'text', required: true },
        { name: 'status', type: 'number', onlyInt: true },
        { name: 'resposta', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(logs)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('webhook_logs'))
    app.delete(app.findCollectionByNameOrId('webhooks'))
  },
)
