routerAdd(
  'POST',
  '/backend/v1/ai/generate-titles',
  (e) => {
    const body = e.requestInfo().body || {}
    const theme = body.theme || 'Marketing Digital'

    const aiUrl = $secrets.get('SKIP_AI_GATEWAY_URL')
    const aiKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

    let titles = []

    if (aiUrl && aiKey) {
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
    }

    if (titles.length < 8) {
      titles = [
        `O Guia Definitivo sobre ${theme}: Tudo que Você Precisa Saber`,
        `5 Benefícios Inesperados de ${theme} para o seu Negócio`,
        `Como Dominar ${theme}: Dicas de Especialistas`,
        `Mitos e Verdades sobre ${theme} que Você Deveria Conhecer`,
        `${theme} para Iniciantes: Comece da Forma Certa`,
        `As Maiores Tendências de ${theme} para Este Ano`,
        `Por Que ${theme} Está Revolucionando o Mercado?`,
        `Checklist: Como Otimizar seus Resultados com ${theme}`,
      ]
    }

    return e.json(200, { titles: titles.slice(0, 8) })
  },
  $apis.requireAuth(),
)
