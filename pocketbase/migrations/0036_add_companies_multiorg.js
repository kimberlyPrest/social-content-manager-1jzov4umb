migrate(
  (app) => {
    // ── 1. companies: novos campos e regras multi-org ──────────────────────
    const col = app.findCollectionByNameOrId('companies')

    if (!col.fields.getByName('tipo')) {
      col.fields.add(
        new SelectField({
          name: 'tipo',
          values: ['principal', 'secundaria'],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('instagram_business_id')) {
      col.fields.add(new TextField({ name: 'instagram_business_id' }))
    }
    // organizacao_id aponta para o ID da empresa principal da organização
    if (!col.fields.getByName('organizacao_id')) {
      col.fields.add(new TextField({ name: 'organizacao_id' }))
    }

    // Permite que usuários vejam todas as empresas da sua organização
    col.listRule =
      "id = @request.auth.empresa_id || organizacao_id = @request.auth.empresa_id"
    col.viewRule =
      "id = @request.auth.empresa_id || organizacao_id = @request.auth.empresa_id"
    col.createRule =
      "@request.auth.role = 'master' || @request.auth.role = 'admin'"
    col.updateRule =
      "(id = @request.auth.empresa_id || organizacao_id = @request.auth.empresa_id) && (@request.auth.role = 'master' || @request.auth.role = 'admin')"

    app.save(col)

    // ── 2. users: papel master + campo empresas_acesso ─────────────────────
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const roleField = users.fields.getByName('role')
    if (roleField && !roleField.values.includes('master')) {
      roleField.values = ['master', 'admin', 'criador', 'analista']
    }
    if (!users.fields.getByName('empresas_acesso')) {
      users.fields.add(new JSONField({ name: 'empresas_acesso' }))
    }
    app.save(users)

    // ── 3. posts: permitir acesso a empresas secundárias ───────────────────
    const posts = app.findCollectionByNameOrId('posts')
    posts.listRule =
      "empresa_id = @request.auth.empresa_id || @request.auth.empresas_acesso ?~ empresa_id"
    posts.viewRule =
      "empresa_id = @request.auth.empresa_id || @request.auth.empresas_acesso ?~ empresa_id"
    posts.createRule =
      "empresa_id = @request.auth.empresa_id || @request.auth.empresas_acesso ?~ empresa_id"
    posts.updateRule =
      "empresa_id = @request.auth.empresa_id || @request.auth.empresas_acesso ?~ empresa_id"
    app.save(posts)

    // ── 4. ab_tests: mesma lógica ──────────────────────────────────────────
    const abTests = app.findCollectionByNameOrId('ab_tests')
    abTests.listRule =
      "empresa_id = @request.auth.empresa_id || @request.auth.empresas_acesso ?~ empresa_id"
    abTests.viewRule =
      "empresa_id = @request.auth.empresa_id || @request.auth.empresas_acesso ?~ empresa_id"
    abTests.createRule =
      "empresa_id = @request.auth.empresa_id || @request.auth.empresas_acesso ?~ empresa_id"
    abTests.updateRule =
      "empresa_id = @request.auth.empresa_id || @request.auth.empresas_acesso ?~ empresa_id"
    app.save(abTests)

    // ── 5. Marca empresas existentes como principal ────────────────────────
    try {
      const existing = app.findRecordsByFilter('companies', '', '', 100, 0)
      for (const company of existing) {
        if (!company.getString('tipo')) {
          company.set('tipo', 'principal')
          app.saveNoValidate(company)
        }
      }
    } catch (_) {}
  },
  (app) => {
    const col = app.findCollectionByNameOrId('companies')
    if (col.fields.getByName('tipo')) col.fields.removeByName('tipo')
    if (col.fields.getByName('instagram_business_id'))
      col.fields.removeByName('instagram_business_id')
    if (col.fields.getByName('organizacao_id')) col.fields.removeByName('organizacao_id')
    col.listRule = 'id = @request.auth.empresa_id'
    col.viewRule = 'id = @request.auth.empresa_id'
    col.createRule = null
    col.updateRule = null
    app.save(col)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')
    if (roleField) roleField.values = ['admin', 'criador', 'analista']
    if (users.fields.getByName('empresas_acesso')) users.fields.removeByName('empresas_acesso')
    app.save(users)

    const posts = app.findCollectionByNameOrId('posts')
    posts.listRule = 'empresa_id = @request.auth.empresa_id'
    posts.viewRule = 'empresa_id = @request.auth.empresa_id'
    posts.createRule = 'empresa_id = @request.auth.empresa_id'
    posts.updateRule = 'empresa_id = @request.auth.empresa_id'
    app.save(posts)

    const abTests = app.findCollectionByNameOrId('ab_tests')
    abTests.listRule = 'empresa_id = @request.auth.empresa_id'
    abTests.viewRule = 'empresa_id = @request.auth.empresa_id'
    abTests.createRule = 'empresa_id = @request.auth.empresa_id'
    abTests.updateRule = 'empresa_id = @request.auth.empresa_id'
    app.save(abTests)
  },
)
