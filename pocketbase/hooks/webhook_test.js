routerAdd(
  'POST',
  '/backend/v1/webhooks/{id}/test',
  async (e) => {
    const id = e.request.pathValue('id')
    const webhook = $app.findRecordById('webhooks', id)

    if (webhook.getString('empresa_id') !== e.auth?.getString('empresa_id')) {
      return e.forbiddenError('Not authorized')
    }

    const url = webhook.getString('url')
    const secret = webhook.getString('secret')
    const eventos = webhook.get('eventos') || []
    const gatilho = eventos.length > 0 ? eventos[0] : 'teste_manual'

    const payload = {
      evento: gatilho,
      timestamp: new Date().toISOString(),
      dados: { id: 'test_123', mensagem: 'Este é um disparo de teste' },
    }

    const headers = { 'Content-Type': 'application/json' }
    if (secret) {
      headers['X-Webhook-Secret'] = secret
    }

    try {
      const res = $http.send({
        url: url,
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        timeout: 10,
      })

      const finalStatus = res.statusCode
      const finalResponse = 'Success'

      const logsCol = $app.findCollectionByNameOrId('webhook_logs')
      const logRec = new Record(logsCol)
      logRec.set('webhook_id', webhook.id)
      logRec.set('evento', 'teste_manual')
      logRec.set('status', finalStatus)
      logRec.set('resposta', finalResponse.substring(0, 250))
      $app.save(logRec)

      webhook.set('ultimo_disparo', new Date().toISOString())
      $app.save(webhook)

      if (finalStatus >= 200 && finalStatus < 300) {
        return e.json(200, { status: finalStatus, resposta: finalResponse })
      } else {
        return e.json(500, { error: `Erro ao enviar webhook. Status: ${finalStatus}` })
      }
    } catch (err) {
      const logsCol = $app.findCollectionByNameOrId('webhook_logs')
      const logRec = new Record(logsCol)
      logRec.set('webhook_id', webhook.id)
      logRec.set('evento', 'teste_manual')
      logRec.set('status', 500)
      logRec.set('resposta', err.message.substring(0, 250))
      $app.save(logRec)

      return e.json(500, { error: `Erro ao enviar webhook. Status: 500. Detalhes: ${err.message}` })
    }
  },
  $apis.requireAuth(),
)
