migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('data_nascimento')) {
      users.fields.add(new DateField({ name: 'data_nascimento' }))
    }
    if (!users.fields.getByName('foto_url')) {
      users.fields.add(new TextField({ name: 'foto_url' }))
    }

    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['admin', 'criador', 'analista', 'master']
    }

    users.listRule =
      "empresa_id = @request.auth.empresa_id && (@request.auth.role = 'admin' || @request.auth.role = 'master' || id = @request.auth.id)"
    users.viewRule =
      "empresa_id = @request.auth.empresa_id && (@request.auth.role = 'admin' || @request.auth.role = 'master' || id = @request.auth.id)"
    users.updateRule =
      "id = @request.auth.id || ((@request.auth.role = 'master' || @request.auth.role = 'admin') && empresa_id = @request.auth.empresa_id)"
    users.deleteRule =
      "id = @request.auth.id || (@request.auth.role = 'master' && empresa_id = @request.auth.empresa_id)"

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('data_nascimento')
    users.fields.removeByName('foto_url')

    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['admin', 'criador', 'analista']
    }

    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'empresa_id = @request.auth.empresa_id'
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'

    app.save(users)
  },
)
