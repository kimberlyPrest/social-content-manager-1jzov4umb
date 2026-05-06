migrate(
  (app) => {
    const collection = new Collection({
      name: 'automacoes',
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
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        {
          name: 'gatilho',
          type: 'select',
          required: true,
          values: [
            'post_publicado',
            'novo_comentario',
            'teste_finalizado',
            'mencao',
            'post_agendado',
          ],
          maxSelect: 1,
        },
        {
          name: 'ferramenta',
          type: 'select',
          required: true,
          values: ['zapier', 'make'],
          maxSelect: 1,
        },
        { name: 'webhook_url', type: 'url', required: true },
        { name: 'ativa', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('automacoes')
    app.delete(collection)
  },
)
