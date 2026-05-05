routerAdd(
  'DELETE',
  '/backend/v1/posts/{id}',
  (e) => {
    const id = e.request.pathValue('id')
    let post
    try {
      post = $app.findRecordById('posts', id)
    } catch (_) {
      throw new NotFoundError('Post não encontrado')
    }

    const auth = e.auth
    if (!auth) {
      throw new UnauthorizedError('Acesso negado')
    }

    const isCreator = auth.id === post.getString('criador_id')
    const isAdmin = auth.getString('role') === 'admin'

    if (!isCreator && !isAdmin) {
      throw new ForbiddenError('Você não pode deletar posts de outros usuários')
    }

    try {
      $app.runInTransaction((txApp) => {
        const metrics = txApp.findRecordsByFilter('metrics_posts', `post_id = "${id}"`, '', 9999, 0)
        for (let i = 0; i < metrics.length; i++) {
          txApp.delete(metrics[i])
        }

        const comentarios = txApp.findRecordsByFilter(
          'comentarios',
          `post_id = "${id}"`,
          '',
          9999,
          0,
        )
        for (let i = 0; i < comentarios.length; i++) {
          txApp.delete(comentarios[i])
        }

        txApp.delete(post)
      })
    } catch (err) {
      $app.logger().error('Erro ao deletar post', 'error', err.message || String(err), 'postId', id)
      throw new InternalServerError('Erro ao deletar post. Tente novamente.')
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
