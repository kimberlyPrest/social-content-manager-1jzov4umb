routerAdd('POST', '/backend/v1/recovery/request', (e) => {
  const body = e.requestInfo().body
  if (!body || !body.email) return e.badRequestError('Email é obrigatório')

  try {
    $app.findAuthRecordByEmail('users', body.email)
    return e.json(200, { success: true })
  } catch (_) {
    return e.badRequestError('Usuário não encontrado')
  }
})
