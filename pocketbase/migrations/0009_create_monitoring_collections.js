migrate(
  (app) => {
    const mensagens_diretas = new Collection({
      name: 'mensagens_diretas',
      type: 'base',
      listRule: 'empresa_id = @request.auth.empresa_id',
      viewRule: 'empresa_id = @request.auth.empresa_id',
      createRule: 'empresa_id = @request.auth.empresa_id',
      updateRule: 'empresa_id = @request.auth.empresa_id',
      deleteRule: null,
      fields: [
        {
          name: 'empresa_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        },
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'destinatario', type: 'text', required: true },
        {
          name: 'rede_social',
          type: 'select',
          required: true,
          values: ['facebook', 'instagram', 'linkedin', 'tiktok'],
          maxSelect: 1,
        },
        { name: 'mensagem', type: 'text', required: true },
        { name: 'status', type: 'select', values: ['enviado', 'falhou'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(mensagens_diretas)

    const oportunidades = new Collection({
      name: 'oportunidades',
      type: 'base',
      listRule: 'empresa_id = @request.auth.empresa_id',
      viewRule: 'empresa_id = @request.auth.empresa_id',
      createRule: 'empresa_id = @request.auth.empresa_id',
      updateRule: 'empresa_id = @request.auth.empresa_id',
      deleteRule: null,
      fields: [
        {
          name: 'empresa_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        },
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'post_id', type: 'text', required: true },
        { name: 'autor', type: 'text', required: true },
        { name: 'rede_social', type: 'text', required: true },
        { name: 'conteudo', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['nova', 'respondida', 'ignorada', 'arquivada'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(oportunidades)

    const posts_monitorados = new Collection({
      name: 'posts_monitorados',
      type: 'base',
      listRule: 'empresa_id = @request.auth.empresa_id',
      viewRule: 'empresa_id = @request.auth.empresa_id',
      createRule: 'empresa_id = @request.auth.empresa_id',
      updateRule: 'empresa_id = @request.auth.empresa_id',
      deleteRule: null,
      fields: [
        {
          name: 'empresa_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('companies').id,
          maxSelect: 1,
        },
        {
          name: 'monitoramento_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('monitoring').id,
          maxSelect: 1,
        },
        { name: 'autor', type: 'text' },
        { name: 'rede_social', type: 'text' },
        { name: 'conteudo', type: 'text' },
        { name: 'curtidas', type: 'number' },
        { name: 'comentarios', type: 'number' },
        { name: 'compartilhamentos', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(posts_monitorados)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('posts_monitorados'))
    app.delete(app.findCollectionByNameOrId('oportunidades'))
    app.delete(app.findCollectionByNameOrId('mensagens_diretas'))
  },
)
