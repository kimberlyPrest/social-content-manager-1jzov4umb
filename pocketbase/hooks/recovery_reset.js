routerAdd('POST', '/backend/v1/recovery/reset', (e) => {
  const body = e.requestInfo().body
  if (!body || !body.email || !body.code || !body.password) {
    return e.badRequestError('Dados incompletos')
  }

  if (body.code !== '123456') {
    return e.badRequestError('Código inválido')
  }

  try {
    const record = $app.findAuthRecordByEmail('users', body.email)
    record.setPassword(body.password)
    $app.save(record)
    return e.json(200, { success: true })
  } catch (_) {
    return e.badRequestError('Erro ao redefinir senha')
  }
})
