migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Garantir que o usuário de sistema existe
    try {
      const existing = app.findRecordById('_pb_users_auth_', 'system_sync_usr')
    } catch (_) {
      const record = new Record(users)
      record.setId('system_sync_usr')
      record.set('username', 'sincronizacao')
      record.set('email', 'sync@sistema.local')
      record.set('name', 'Sincronização')
      record.set('role', 'admin')
      record.set('ativo', true)
      // empresa_id é obrigatório no schema, mas vamos usar saveNoValidate
      // ou atribuir a uma empresa se necessário. Para evitar problemas de visibilidade,
      // vamos deixar sem empresa_id e ajustar a regra de visualização.
      app.saveNoValidate(record)
    }

    // Ajustar regra de visualização dos usuários para permitir ver o usuário de sistema
    users.viewRule = 'empresa_id = @request.auth.empresa_id || id = "system_sync_usr"'
    app.save(users)
  },
  (app) => {
    try {
      const record = app.findRecordById('_pb_users_auth_', 'system_sync_usr')
      app.delete(record)
    } catch (_) {}

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.viewRule = 'empresa_id = @request.auth.empresa_id'
    app.save(users)
  },
)
