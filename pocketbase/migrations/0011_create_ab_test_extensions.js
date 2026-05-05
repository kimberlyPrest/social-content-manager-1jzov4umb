migrate(
  (app) => {
    const abTests = app.findCollectionByNameOrId('ab_tests')

    if (!abTests.fields.getByName('metrica_principal')) {
      abTests.fields.add(new TextField({ name: 'metrica_principal' }))
    }
    if (!abTests.fields.getByName('dias_duracao')) {
      abTests.fields.add(new NumberField({ name: 'dias_duracao' }))
    }
    app.save(abTests)

    const companiesId = app.findCollectionByNameOrId('companies').id

    const recomendacoes = new Collection({
      name: 'recomendacoes',
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
          collectionId: companiesId,
          maxSelect: 1,
        },
        {
          name: 'teste_ab_id',
          type: 'relation',
          required: true,
          collectionId: abTests.id,
          maxSelect: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['performance', 'horario', 'rede', 'conteudo'],
          maxSelect: 1,
        },
        { name: 'mensagem', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(recomendacoes)

    const preferencias = new Collection({
      name: 'preferencias_usuario',
      type: 'base',
      listRule: 'usuario_id.empresa_id = @request.auth.empresa_id',
      viewRule: 'usuario_id.empresa_id = @request.auth.empresa_id',
      createRule: 'usuario_id = @request.auth.id',
      updateRule: 'usuario_id = @request.auth.id',
      deleteRule: null,
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['estilo_post', 'horario_publicacao', 'rede_preferida'],
          maxSelect: 1,
        },
        { name: 'valor', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(preferencias)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('preferencias_usuario'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('recomendacoes'))
    } catch (_) {}
    try {
      const abTests = app.findCollectionByNameOrId('ab_tests')
      abTests.fields.removeByName('metrica_principal')
      abTests.fields.removeByName('dias_duracao')
      app.save(abTests)
    } catch (_) {}
  },
)
