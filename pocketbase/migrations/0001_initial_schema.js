migrate(
  (app) => {
    // 1. Companies
    const companies = new Collection({
      name: 'companies',
      type: 'base',
      listRule: 'id = @request.auth.empresa_id',
      viewRule: 'id = @request.auth.empresa_id',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'logo_url', type: 'file', maxSelect: 1, mimeTypes: ['image/jpeg', 'image/png'] },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(companies)
    const companiesId = companies.id

    // 2. Users Update
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['admin', 'criador', 'analista'],
        maxSelect: 1,
        required: true,
      }),
    )
    users.fields.add(
      new RelationField({
        name: 'empresa_id',
        collectionId: companiesId,
        maxSelect: 1,
        required: true,
      }),
    )
    users.fields.add(new BoolField({ name: 'ativo' }))
    users.viewRule = 'empresa_id = @request.auth.empresa_id'
    app.save(users)

    // 3. Posts
    const posts = new Collection({
      name: 'posts',
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
          collectionId: companiesId,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'criador_id',
          type: 'relation',
          collectionId: users.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'conteudo', type: 'text' },
        { name: 'imagens', type: 'file', maxSelect: 10, mimeTypes: ['image/jpeg', 'image/png'] },
        { name: 'videos', type: 'file', maxSelect: 5, mimeTypes: ['video/mp4'] },
        { name: 'redes_sociais', type: 'json' },
        { name: 'agendado_para', type: 'date' },
        { name: 'publicado_em', type: 'date' },
        {
          name: 'status',
          type: 'select',
          values: ['rascunho', 'agendado', 'publicado', 'falhou'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(posts)

    // 4. Metrics Posts
    const metrics = new Collection({
      name: 'metrics_posts',
      type: 'base',
      listRule: 'post_id.empresa_id = @request.auth.empresa_id',
      viewRule: 'post_id.empresa_id = @request.auth.empresa_id',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'post_id', type: 'relation', collectionId: posts.id, maxSelect: 1, required: true },
        { name: 'rede_social', type: 'text' },
        { name: 'curtidas', type: 'number' },
        { name: 'comentarios', type: 'number' },
        { name: 'compartilhamentos', type: 'number' },
        { name: 'alcance', type: 'number' },
        { name: 'impressoes', type: 'number' },
        { name: 'cliques', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(metrics)

    // 5. AB Tests
    const abTests = new Collection({
      name: 'ab_tests',
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
          collectionId: companiesId,
          maxSelect: 1,
          required: true,
        },
        { name: 'post_id_a', type: 'relation', collectionId: posts.id, maxSelect: 1 },
        { name: 'post_id_b', type: 'relation', collectionId: posts.id, maxSelect: 1 },
        { name: 'status', type: 'select', values: ['ativo', 'finalizado'], maxSelect: 1 },
        { name: 'vencedor', type: 'select', values: ['a', 'b', 'empate'], maxSelect: 1 },
        { name: 'finalizado_em', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(abTests)

    // 6. Monitoring
    const monitoring = new Collection({
      name: 'monitoring',
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
          collectionId: companiesId,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'tipo',
          type: 'select',
          values: ['hashtag', 'palavra_chave', 'mencao', 'concorrente'],
          maxSelect: 1,
        },
        { name: 'valor', type: 'text' },
        { name: 'rede_social', type: 'text' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(monitoring)

    // 7. Notifications
    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: 'usuario_id = @request.auth.id',
      viewRule: 'usuario_id = @request.auth.id',
      createRule: null,
      updateRule: 'usuario_id = @request.auth.id',
      deleteRule: null,
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          collectionId: users.id,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'tipo',
          type: 'select',
          values: ['post_publicado', 'comentario', 'mencao', 'teste_finalizado'],
          maxSelect: 1,
        },
        { name: 'mensagem', type: 'text' },
        { name: 'lida', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(notifications)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('notifications'))
    app.delete(app.findCollectionByNameOrId('monitoring'))
    app.delete(app.findCollectionByNameOrId('ab_tests'))
    app.delete(app.findCollectionByNameOrId('metrics_posts'))
    app.delete(app.findCollectionByNameOrId('posts'))

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('role')
    users.fields.removeByName('empresa_id')
    users.fields.removeByName('ativo')
    app.save(users)

    app.delete(app.findCollectionByNameOrId('companies'))
  },
)
