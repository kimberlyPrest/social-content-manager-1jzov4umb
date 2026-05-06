migrate(
  (app) => {
    const companiesId = app.findCollectionByNameOrId('companies').id

    const backups = new Collection({
      name: 'backups',
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
          collectionId: companiesId,
          maxSelect: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['manual', 'automatico'],
          maxSelect: 1,
        },
        { name: 'arquivo_url', type: 'file', required: true, maxSelect: 1, maxSize: 524288000 },
        { name: 'tamanho', type: 'number' },
        { name: 'status', type: 'select', values: ['sucesso', 'falha'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(backups)

    const configuracao_backup = new Collection({
      name: 'configuracao_backup',
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
          collectionId: companiesId,
          maxSelect: 1,
        },
        { name: 'ativo', type: 'bool' },
        {
          name: 'frequencia',
          type: 'select',
          values: ['diaria', 'semanal', 'mensal'],
          required: true,
          maxSelect: 1,
        },
        { name: 'horario', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(configuracao_backup)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('configuracao_backup'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('backups'))
    } catch (e) {}
  },
)
