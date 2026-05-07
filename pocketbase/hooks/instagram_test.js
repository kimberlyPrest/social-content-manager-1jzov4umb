routerAdd(
  'POST',
  '/backend/v1/instagram/test',
  (e) => {
    const token = $secrets.get('INSTAGRAM_API_KEY')

    if (!token) {
      return e.json(400, {
        ok: false,
        motivo: 'A chave INSTAGRAM_API_KEY está ausente no ambiente',
      })
    }

    let igId = ''
    try {
      const authUser = e.auth
      if (authUser) {
        const company = $app.findRecordById('companies', authUser.getString('empresa_id'))
        igId = company.getString('instagram_business_id')
      }
    } catch (_) {}
    if (!igId) igId = $secrets.get('INSTAGRAM_ID')

    if (!igId) {
      return e.json(400, {
        ok: false,
        motivo: 'Instagram Business Account ID não configurado para esta empresa.',
      })
    }

    const maskedToken = token.length > 6 ? token.substring(0, 6) + '...' : '******'
    const url = `https://graph.facebook.com/v25.0/${igId}?fields=id,username&access_token=${token}`

    let res
    try {
      res = $http.send({
        url: url,
        method: 'GET',
        timeout: 15,
      })
    } catch (err) {
      $app
        .logger()
        .error(
          '[INSTAGRAM_TEST] Falha de transporte',
          'error',
          err.message,
          'maskedToken',
          maskedToken,
        )
      return e.json(500, {
        ok: false,
        motivo: 'Falha de conexão com a API do Instagram',
        resposta: err.message,
      })
    }

    const body = res.json || {}

    $app
      .logger()
      .info(
        '[INSTAGRAM_TEST] Resposta da API',
        'status',
        res.statusCode,
        'body',
        body,
        'maskedToken',
        maskedToken,
      )

    if (res.statusCode === 200) {
      return e.json(200, {
        ok: true,
        ig_id: body.id,
        username: body.username,
      })
    }

    if (res.statusCode === 401 || (body.error && body.error.code === 190)) {
      return e.json(401, {
        ok: false,
        motivo: 'INSTAGRAM_API_KEY inválido ou expirado',
        resposta: body,
      })
    }

    if (res.statusCode === 400) {
      return e.json(400, {
        ok: false,
        motivo: 'INSTAGRAM_ID inválido ou não é um IG Business Account',
        resposta: body,
      })
    }

    return e.json(res.statusCode || 500, {
      ok: false,
      motivo: 'Erro desconhecido retornado pela API do Instagram',
      resposta: body,
    })
  },
  $apis.requireAuth(),
)
