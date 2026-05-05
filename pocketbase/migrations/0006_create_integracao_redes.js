migrate(
  (app) => {
    const companiesCollection = app.findCollectionByNameOrId('companies')

    const collection = new Collection({
      name: 'integracao_redes',
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
          collectionId: companiesCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'rede_social',
          type: 'select',
          required: true,
          values: ['facebook', 'instagram', 'linkedin', 'tiktok'],
          maxSelect: 1,
        },
        {
          name: 'access_token',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['conectado', 'desconectado', 'expirado'],
          maxSelect: 1,
        },
        {
          name: 'data_expiracao',
          type: 'date',
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: ['CREATE INDEX idx_integracao_redes_empresa ON integracao_redes (empresa_id)'],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('integracao_redes')
    app.delete(collection)
  },
)
