onRecordAfterCreateSuccess((e) => {
  const post = e.record
  const atividades = $app.findCollectionByNameOrId('atividades')
  const act = new Record(atividades)
  act.set('empresa_id', post.getString('empresa_id'))
  act.set('usuario_id', post.getString('criador_id'))
  act.set('tipo', 'post_criado')
  act.set('descricao', 'Criou um novo post: ' + post.getString('titulo'))
  act.set('referencia_id', post.id)
  $app.save(act)
  e.next()
}, 'posts')

onRecordAfterUpdateSuccess((e) => {
  const post = e.record
  const original = post.original()

  const oldStatus = original.getString('status_aprovacao')
  const newStatus = post.getString('status_aprovacao')

  if (oldStatus !== newStatus) {
    const atividades = $app.findCollectionByNameOrId('atividades')
    const act = new Record(atividades)
    act.set('empresa_id', post.getString('empresa_id'))

    let updaterId = post.getString('criador_id')
    try {
      const auth = e.requestInfo().auth
      if (auth && auth.id) {
        updaterId = auth.id
      }
    } catch (_) {}

    act.set('usuario_id', updaterId)

    if (newStatus === 'aguardando_aprovacao') {
      act.set('tipo', 'aprovacao_solicitada')
      act.set('descricao', 'Solicitou aprovação para o post: ' + post.getString('titulo'))
    } else if (newStatus === 'aprovado') {
      act.set('tipo', 'post_aprovado')
      act.set('descricao', 'Aprovou o post: ' + post.getString('titulo'))

      if (updaterId !== post.getString('criador_id')) {
        const notifs = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifs)
        notif.set('usuario_id', post.getString('criador_id'))
        notif.set('tipo', 'post_aprovado')
        notif.set('mensagem', 'Seu post foi aprovado: ' + post.getString('titulo'))
        notif.set('referencia_id', post.id)
        notif.set('lida', false)
        $app.save(notif)
      }
    } else if (newStatus === 'rejeitado') {
      act.set('tipo', 'post_rejeitado')
      act.set('descricao', 'Rejeitou o post: ' + post.getString('titulo'))
    } else {
      return e.next()
    }

    act.set('referencia_id', post.id)
    $app.save(act)
  }

  e.next()
}, 'posts')
