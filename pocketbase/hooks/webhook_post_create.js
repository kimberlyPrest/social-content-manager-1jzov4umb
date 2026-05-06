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

  return e.next()
}, 'posts')
