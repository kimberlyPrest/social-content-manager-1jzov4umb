migrate((app) => {
  try {
    const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'eduardo@supremoaroma.com.br')
    const companyId = admin.getString('empresa_id')

    const posts = app.findRecordsByFilter('posts', `empresa_id = '${companyId}'`, '-created', 1, 0)
    if (posts.length === 0) return
    const post = posts[0]

    try {
      app.findFirstRecordByData('comentarios', 'conteudo', 'Ótimo post! Seed comment')
    } catch (_) {
      const commentCol = app.findCollectionByNameOrId('comentarios')
      const comment = new Record(commentCol)
      comment.set('post_id', post.id)
      comment.set('usuario_id', admin.id)
      comment.set('conteudo', 'Ótimo post! Seed comment')
      app.save(comment)
    }

    try {
      app.findFirstRecordByData('atividades', 'descricao', 'Criou um novo post: Seed activity')
    } catch (_) {
      const actCol = app.findCollectionByNameOrId('atividades')
      const act = new Record(actCol)
      act.set('empresa_id', companyId)
      act.set('usuario_id', admin.id)
      act.set('tipo', 'post_criado')
      act.set('descricao', 'Criou um novo post: Seed activity')
      act.set('referencia_id', post.id)
      app.save(act)
    }

    try {
      app.findFirstRecordByData(
        'notifications',
        'mensagem',
        'Você tem um novo comentário. Seed notification',
      )
    } catch (_) {
      const notCol = app.findCollectionByNameOrId('notifications')
      const notif = new Record(notCol)
      notif.set('usuario_id', admin.id)
      notif.set('tipo', 'comentario')
      notif.set('mensagem', 'Você tem um novo comentário. Seed notification')
      notif.set('referencia_id', post.id)
      notif.set('lida', false)
      app.save(notif)
    }
  } catch (e) {}
})
