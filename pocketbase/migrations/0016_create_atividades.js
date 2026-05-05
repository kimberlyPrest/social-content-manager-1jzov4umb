migrate(
  (app) => {
    const col = new Collection({
      name: 'atividades',
      type: 'base',
      listRule: "@request.auth.id != '' && empresa_id = @request.auth.empresa_id",
      viewRule: "@request.auth.id != '' && empresa_id = @request.auth.empresa_id",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'empresa_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: [
            'post_criado',
            'post_editado',
            'comentario_adicionado',
            'post_agendado',
            'post_publicado',
            'teste_criado',
            'teste_finalizado',
            'membro_adicionado',
            'membro_removido',
            'aprovacao_solicitada',
            'post_aprovado',
            'post_rejeitado',
          ],
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: true },
        { name: 'referencia_id', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(col)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('atividades'))
  },
)
