routerAdd(
  'POST',
  '/backend/v1/ai/generate-titles',
  (e) => {
    const body = e.requestInfo().body || {}
    const theme = body.theme || 'Marketing Digital'

    const aiUrl = $secrets.get('SKIP_AI_GATEWAY_URL')
    const aiKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

    if (!aiUrl || !aiKey) {
      return e.badRequestError(
        'Configuração de IA pendente. Por favor, verifique as chaves de acesso nas configurações do sistema.',
      )
    }

    let titles = []

    try {
      const res = $http.send({
        url: aiUrl + '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + aiKey,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Você é um especialista em SEO e Marketing de Conteúdo. Retorne EXATAMENTE 8 títulos altamente otimizados e atrativos para artigos de blog sobre o tema fornecido. Retorne APENAS um array JSON válido contendo as 8 strings (exemplo: ["Titulo 1", "Titulo 2"]), sem qualquer formatação markdown, comentários ou texto adicional.',
            },
            { role: 'user', content: 'Tema: ' + theme },
          ],
        }),
      })

      if (res.statusCode === 200) {
        let content = res.json.choices[0].message.content.trim()
        content = content
          .replace(/^```json/, '')
          .replace(/```$/, '')
          .trim()
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed) && parsed.length > 0) titles = parsed
      }
    } catch (err) {
      $app.logger().error('Error calling AI gateway', 'error', err.message)
    }

    if (titles.length === 0) {
      return e.badRequestError('A IA não retornou sugestões de títulos. Tente novamente.')
    }

    return e.json(200, { titles: titles.slice(0, 8) })
  },
  $apis.requireAuth(),
)
