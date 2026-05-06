migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')
    if (!companies.fields.getByName('email_contato')) {
      companies.fields.add(new TextField({ name: 'email_contato' }))
    }
    if (!companies.fields.getByName('telefone')) {
      companies.fields.add(new TextField({ name: 'telefone' }))
    }
    if (!companies.fields.getByName('endereco')) {
      companies.fields.add(new TextField({ name: 'endereco' }))
    }
    app.save(companies)

    const prefs = app.findCollectionByNameOrId('preferencias_usuario')
    const tipoField = prefs.fields.getByName('tipo')
    if (tipoField) {
      tipoField.values = [
        'estilo_post',
        'horario_publicacao',
        'rede_preferida',
        'publicar_automaticamente',
        'notificar_publicacao',
        'notificacao_email',
        'notificacao_push',
        'frequencia_resumo',
        'alerta_baixo_engajamento',
      ]
    }
    app.save(prefs)

    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('two_factor_enabled')) {
      users.fields.add(new BoolField({ name: 'two_factor_enabled' }))
    }
    app.save(users)
  },
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')
    companies.fields.removeByName('email_contato')
    companies.fields.removeByName('telefone')
    companies.fields.removeByName('endereco')
    app.save(companies)

    const prefs = app.findCollectionByNameOrId('preferencias_usuario')
    const tipoField = prefs.fields.getByName('tipo')
    if (tipoField) {
      tipoField.values = ['estilo_post', 'horario_publicacao', 'rede_preferida']
    }
    app.save(prefs)

    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('two_factor_enabled')
    app.save(users)
  },
)
