onRecordAfterCreateSuccess(async (e) => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const empresaId = e.record.getString('empresa_id')
  const status = e.record.getString('status')

  let gatilho = null
  if (status === 'publicado') {
    gatilho = 'post_publicado'
  } else if (status === 'agendado') {
    gatilho = 'post_agendado'
  }

  if (!gatilho) return e.next()

  try {
    const automacoes = $app.findRecordsByFilter(
      'automacoes',
      `empresa_id = {:empresaId} && gatilho = {:gatilho} && ativa = true`,
      '-created',
      100,
      0,
      {
        empresaId: empresaId,
        gatilho: gatilho,
      },
    )

    const payload = {
      evento: gatilho,
      dados: JSON.parse(JSON.stringify(e.record)),
    }

    for (const auto of automacoes) {
      const url = auto.getString('webhook_url')
      const delays = [2000, 4000, 8000]

      for (let i = 0; i <= delays.length; i++) {
        try {
          const res = $http.send({
            url: url,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            timeout: 10,
          })
          if (res.statusCode >= 200 && res.statusCode < 300) {
            $app.logger().info('Webhook sent successfully', 'url', url, 'gatilho', gatilho)
            break
          }
          throw new Error(`HTTP ${res.statusCode}`)
        } catch (err) {
          if (i === delays.length) {
            $app.logger().error('Webhook failed after retries', 'url', url, 'error', err.message)
            break
          }
          try {
            if (typeof setTimeout !== 'undefined') await sleep(delays[i])
          } catch (_) {}
        }
      }
    }
  } catch (err) {
    $app.logger().error('Error processing webhooks', 'error', err.message)
  }

  // Disparo de Webhooks Customizados
  try {
    const customWebhooks = $app.findRecordsByFilter(
      'webhooks',
      `empresa_id = {:empresaId} && ativo = true`,
      '-created',
      100,
      0,
      { empresaId: empresaId },
    )

    const now = new Date().toISOString()
    const customPayload = {
      evento: gatilho,
      timestamp: now,
      dados: JSON.parse(JSON.stringify(e.record)),
    }

    for (const webhook of customWebhooks) {
      const eventos = webhook.get('eventos')
      if (!Array.isArray(eventos) || !eventos.includes(gatilho)) continue

      const url = webhook.getString('url')
      const secret = webhook.getString('secret')

      const headers = { 'Content-Type': 'application/json' }
      if (secret) {
        headers['X-Webhook-Secret'] = secret
      }

      const delays = [2000, 4000, 8000]
      let finalStatus = 0
      let finalResponse = ''

      for (let i = 0; i <= delays.length; i++) {
        try {
          const res = $http.send({
            url: url,
            method: 'POST',
            headers: headers,
            body: JSON.stringify(customPayload),
            timeout: 10,
          })

          finalStatus = res.statusCode
          finalResponse = 'Success'

          if (res.statusCode >= 200 && res.statusCode < 300) {
            break
          }
          throw new Error(`HTTP ${res.statusCode}`)
        } catch (err) {
          finalStatus = finalStatus || 500
          finalResponse = err.message
          if (i === delays.length) {
            break
          }
          try {
            if (typeof setTimeout !== 'undefined') await sleep(delays[i])
          } catch (_) {}
        }
      }

      try {
        webhook.set('ultimo_disparo', now)
        $app.save(webhook)

        const logsCol = $app.findCollectionByNameOrId('webhook_logs')
        const logRec = new Record(logsCol)
        logRec.set('webhook_id', webhook.id)
        logRec.set('evento', gatilho)
        logRec.set('status', finalStatus)
        logRec.set('resposta', finalResponse.substring(0, 250))
        $app.save(logRec)
      } catch (logErr) {
        $app.logger().error('Failed to save webhook log', 'error', logErr.message)
      }
    }
  } catch (err) {
    $app.logger().error('Error processing custom webhooks', 'error', err.message)
  }

  return e.next()
}, 'posts')
