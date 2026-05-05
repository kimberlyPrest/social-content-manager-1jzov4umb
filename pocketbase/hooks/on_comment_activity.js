onRecordAfterCreateSuccess((e) => {
  const comment = e.record
  const post = $app.findRecordById('posts', comment.getString('post_id'))

  const atividades = $app.findCollectionByNameOrId('atividades')
  const act = new Record(atividades)
  act.set('empresa_id', post.getString('empresa_id'))
  act.set('usuario_id', comment.getString('usuario_id'))
  act.set('tipo', 'comentario_adicionado')
  act.set('descricao', 'Adicionou um comentário em um post: ' + post.getString('titulo'))
  act.set('referencia_id', post.id)
  $app.save(act)

  const authorId = post.getString('criador_id')
  if (authorId !== comment.getString('usuario_id')) {
    const notifs = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifs)
    notif.set('usuario_id', authorId)
    notif.set('tipo', 'comentario')
    notif.set('mensagem', 'Novo comentário no seu post: ' + post.getString('titulo'))
    notif.set('referencia_id', post.id)
    notif.set('lida', false)
    $app.save(notif)
  }

  e.next()
}, 'comentarios')
