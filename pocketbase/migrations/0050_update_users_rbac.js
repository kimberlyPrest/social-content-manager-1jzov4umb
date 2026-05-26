migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.deleteRule =
      "id = @request.auth.id || ((@request.auth.role = 'master' || @request.auth.role = 'admin') && empresa_id = @request.auth.empresa_id)"
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.deleteRule =
      "id = @request.auth.id || (@request.auth.role = 'master' && empresa_id = @request.auth.empresa_id)"
    app.save(users)
  },
)
