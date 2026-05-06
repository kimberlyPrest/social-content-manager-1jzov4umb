migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')
    let admin
    try {
      admin = app.findFirstRecordByData('users', 'email', 'eduardo@supremoaroma.com.br')
    } catch (_) {
      return
    }

    const empresaId = admin.getString('empresa_id')
    if (!empresaId) return

    const col = app.findCollectionByNameOrId('automacoes')

    try {
      app.findFirstRecordByData('automacoes', 'titulo', 'Novo post → Email')
      return // Already seeded
    } catch (_) {}

    const r1 = new Record(col)
    r1.set('empresa_id', empresaId)
    r1.set('titulo', 'Novo post → Email')
    r1.set('descricao', 'Enviar email quando post é publicado')
    r1.set('gatilho', 'post_publicado')
    r1.set('ferramenta', 'zapier')
    r1.set('webhook_url', 'https://hooks.zapier.com/hooks/catch/12345/abcde')
    r1.set('ativa', true)
    app.save(r1)

    const r2 = new Record(col)
    r2.set('empresa_id', empresaId)
    r2.set('titulo', 'Comentário → Slack')
    r2.set('descricao', 'Notificar no Slack quando novo comentário')
    r2.set('gatilho', 'novo_comentario')
    r2.set('ferramenta', 'make')
    r2.set('webhook_url', 'https://hook.make.com/abcdef12345')
    r2.set('ativa', false)
    app.save(r2)

    const r3 = new Record(col)
    r3.set('empresa_id', empresaId)
    r3.set('titulo', 'Teste finalizado → Email')
    r3.set('descricao', 'Enviar resultado do teste A/B por email')
    r3.set('gatilho', 'teste_finalizado')
    r3.set('ferramenta', 'zapier')
    r3.set('webhook_url', 'https://hooks.zapier.com/hooks/catch/12345/fghij')
    r3.set('ativa', true)
    app.save(r3)
  },
  (app) => {
    // Can be left empty for seed revert if needed
  },
)
