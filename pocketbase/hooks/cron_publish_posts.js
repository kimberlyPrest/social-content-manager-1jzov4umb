cronAdd('publish_scheduled_posts', '*/1 * * * *', () => {
  $app.logger().info('Iniciando verificação de posts agendados')
  const nowStr = new Date().toISOString().replace('T', ' ')
  let posts = []
  try {
    posts = $app.findRecordsByFilter(
      'posts',
      `status = 'agendado' && agendado_para <= {:now}`,
      '-created',
      100,
      0,
      { now: nowStr },
    )
  } catch (e) {
    $app.logger().info('Encontrados 0 posts agendados para publicar')
    return // no rows found
  }

  $app.logger().info(`Encontrados ${posts.length} posts agendados para publicar`)

  for (const post of posts) {
    $app
      .logger()
      .info(`[PUBLISH_START] Publicação iniciada para o post ${post.id}`, 'post_id', post.id)

    let allSuccess = true
    let anyAttempted = false
    let retryLater = false
    let redes = []
    try {
      redes = JSON.parse(post.getString('redes_sociais') || '[]')
    } catch (err) {
      $app.logger().warn('Failed to parse redes_sociais', 'post_id', post.id)
    }

    if (!redes || redes.length === 0) {
      $app.logger().warn('No social networks selected', 'post_id', post.id)
      post.set('status', 'falhou')
      $app.saveNoValidate(post)
      continue
    }

    const titulo = post.getString('titulo')
    const conteudo = post.getString('conteudo')
    const imagens = post.get('imagens')
    const hasImages = imagens && (Array.isArray(imagens) ? imagens.length > 0 : imagens !== '')
    let imageUrl = ''
    if (hasImages) {
      const imageName = Array.isArray(imagens) ? imagens[0] : imagens
      let baseUrl = $os.getenv('VITE_POCKETBASE_URL')
      if (baseUrl && baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)
      imageUrl = `${baseUrl}/api/files/${post.collectionId}/${post.id}/${imageName}`
    }

    for (const rede of redes) {
      let integracao
      try {
        integracao = $app.findFirstRecordByFilter(
          'integracao_redes',
          "empresa_id = {:empresa} && rede_social = {:rede} && status = 'conectado'",
          {
            empresa: post.getString('empresa_id'),
            rede: rede,
          },
        )
      } catch (err) {
        $app.logger().warn(`Integration not found or not connected for ${rede}`, 'post_id', post.id)
      }

      anyAttempted = true
      $app.logger().info(`[TOKEN_RETRIEVAL] Lendo token para ${rede}`, 'post_id', post.id)

      let token = integracao ? integracao.getString('access_token') : ''

      if (!token) {
        let tokenSecretKey = ''
        if (rede === 'facebook') tokenSecretKey = 'FACEBOOK_API_KEY'
        else if (rede === 'instagram') tokenSecretKey = 'INSTAGRAM_API_KEY'
        else if (rede === 'linkedin') tokenSecretKey = 'LINKEDIN_API_KEY'
        else if (rede === 'tiktok') tokenSecretKey = 'TIKTOK_API_KEY'

        token = $secrets.get(tokenSecretKey)

        if (!token) {
          $app
            .logger()
            .error(
              `[TOKEN_ERROR] Token not found in integracao_redes and Secret ${tokenSecretKey} is missing`,
              'post_id',
              post.id,
              'rede',
              rede,
            )
          allSuccess = false
          continue
        }
      }

      let url = ''
      let body = {}
      let headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }

      if (!conteudo && !titulo) {
        $app
          .logger()
          .error(
            `[MISSING_DATA] Missing required content or title for ${rede} (400 Bad Request simulation)`,
            'post_id',
            post.id,
          )
        allSuccess = false
        continue
      }

      const fullText = `${titulo}\n\n${conteudo || ''}`.trim()

      if (rede === 'instagram') {
        const instaId = $secrets.get('INSTAGRAM_ID')
        if (!instaId) {
          $app
            .logger()
            .error('[INSTAGRAM_CONFIG_ERROR] Missing INSTAGRAM_ID secret', 'post_id', post.id)
          allSuccess = false
          continue
        }
        if (!hasImages) {
          $app
            .logger()
            .error('[INSTAGRAM_NO_IMAGE] Instagram requires an image', 'post_id', post.id)
          allSuccess = false
          continue
        }

        const instaImageUrl = imageUrl || ''

        $app.logger().info(`[API_REQUEST] Chamando API da ${rede} (Step 1)`, 'post_id', post.id)
        try {
          const step1Res = $http.send({
            url: `https://graph.facebook.com/v19.0/${instaId}/media`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: instaImageUrl,
              caption: fullText,
              access_token: token,
            }),
            timeout: 30,
          })

          $app
            .logger()
            .info(
              `[INSTAGRAM_STEP1] Status: ${step1Res.statusCode} Body: ${JSON.stringify(step1Res.json || {})}`,
              'post_id',
              post.id,
            )

          if (
            step1Res.statusCode >= 200 &&
            step1Res.statusCode < 300 &&
            step1Res.json &&
            step1Res.json.id
          ) {
            const creationId = step1Res.json.id

            $app.logger().info(`[API_REQUEST] Chamando API da ${rede} (Step 2)`, 'post_id', post.id)
            const step2Res = $http.send({
              url: `https://graph.facebook.com/v19.0/${instaId}/media_publish`,
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                creation_id: creationId,
                access_token: token,
              }),
              timeout: 30,
            })

            $app
              .logger()
              .info(
                `[INSTAGRAM_STEP2] Status: ${step2Res.statusCode} Body: ${JSON.stringify(step2Res.json || {})}`,
                'post_id',
                post.id,
              )

            if (
              step2Res.statusCode >= 200 &&
              step2Res.statusCode < 300 &&
              step2Res.json &&
              step2Res.json.id
            ) {
              post.set('id_externo_instagram', step2Res.json.id)
            } else {
              if (step2Res.statusCode === 401) {
                $app
                  .logger()
                  .error('[ERROR_401] Token expired/invalid for Instagram', 'post_id', post.id)
                if (integracao) {
                  integracao.set('status', 'expirado')
                  $app.saveNoValidate(integracao)
                }
              } else if (step2Res.statusCode >= 500) {
                $app
                  .logger()
                  .error(
                    '[ERROR_500] Network-side server error at Step 2. Try again later',
                    'post_id',
                    post.id,
                  )
                retryLater = true
              }
              allSuccess = false
            }
          } else {
            if (step1Res.statusCode === 401) {
              $app
                .logger()
                .error('[ERROR_401] Token expired/invalid for Instagram', 'post_id', post.id)
              if (integracao) {
                integracao.set('status', 'expirado')
                $app.saveNoValidate(integracao)
              }
            } else if (step1Res.statusCode >= 500) {
              $app
                .logger()
                .error(
                  '[ERROR_500] Network-side server error at Step 1. Try again later',
                  'post_id',
                  post.id,
                )
              retryLater = true
            }
            allSuccess = false
          }
        } catch (err) {
          $app
            .logger()
            .error(
              `[API_EXCEPTION] Exception calling instagram`,
              'post_id',
              post.id,
              'error',
              err.message,
            )
          allSuccess = false
        }

        continue
      }

      if (rede === 'facebook') {
        url = 'https://graph.facebook.com/v19.0/me/feed'
        body = { message: fullText }
      } else if (rede === 'linkedin') {
        url = 'https://api.linkedin.com/v2/ugcPosts'
        body = {
          author: 'urn:li:person:me',
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: fullText },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        }
      } else if (rede === 'tiktok') {
        url = 'https://open.tiktokapis.com/v2/post/publish/video/init/'
        body = { post_info: { title: titulo, description: conteudo } }
      }

      $app
        .logger()
        .info(
          `[API_REQUEST] Chamando API da ${rede}`,
          'post_id',
          post.id,
          'endpoint',
          url,
          'payload',
          JSON.stringify(body),
        )

      try {
        const res = $http.send({
          url: url,
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body),
          timeout: 30,
        })

        $app
          .logger()
          .info(
            `[API_RESPONSE] Resposta da API ${rede}: ${res.statusCode} - ${JSON.stringify(res.json || {})}`,
            'post_id',
            post.id,
          )

        if (res.statusCode >= 200 && res.statusCode < 300) {
          // success
        } else if (res.statusCode === 401) {
          $app
            .logger()
            .error(
              '[ERROR_401] Token expired/invalid. Action required: Reconectar',
              'post_id',
              post.id,
              'rede',
              rede,
            )
          if (integracao) {
            integracao.set('status', 'expirado')
            $app.saveNoValidate(integracao)
          }
          allSuccess = false
        } else if (res.statusCode === 400) {
          $app
            .logger()
            .error(
              '[ERROR_400] Bad Request. Action required: Check missing data (description or image)',
              'post_id',
              post.id,
              'rede',
              rede,
            )
          allSuccess = false
        } else if (res.statusCode >= 500) {
          $app
            .logger()
            .error(
              '[ERROR_500] Network-side server error. Action required: Try again later',
              'post_id',
              post.id,
              'rede',
              rede,
            )
          allSuccess = false
          retryLater = true
        } else {
          allSuccess = false
        }
      } catch (err) {
        $app
          .logger()
          .error(
            `[API_EXCEPTION] Exception calling ${rede}`,
            'post_id',
            post.id,
            'error',
            err.message,
          )
        allSuccess = false
      }
    }

    if (anyAttempted && allSuccess) {
      post.set('status', 'publicado')
      post.set('publicado_em', new Date().toISOString().replace('T', ' '))
      $app.logger().info(`Status do post ${post.id} atualizado para publicado`, 'post_id', post.id)

      try {
        const atividades = $app.findCollectionByNameOrId('atividades')
        const record = new Record(atividades)
        record.set('empresa_id', post.getString('empresa_id'))
        record.set('usuario_id', post.getString('criador_id'))
        record.set('tipo', 'post_publicado')
        record.set('descricao', 'O post foi publicado com sucesso através do agendamento cron.')
        record.set('referencia_id', post.id)
        $app.saveNoValidate(record)
      } catch (err) {
        $app.logger().warn('Failed to create atividade', 'error', err.message)
      }
    } else if (retryLater) {
      const currentAgendado = new Date(post.getString('agendado_para').replace(' ', 'T'))
      currentAgendado.setMinutes(currentAgendado.getMinutes() + 5)
      post.set('agendado_para', currentAgendado.toISOString().replace('T', ' '))
      post.set('status', 'agendado')
      $app
        .logger()
        .info(
          `Status do post ${post.id} atualizado para agendado (retry em 5m)`,
          'post_id',
          post.id,
        )
    } else {
      post.set('status', 'falhou')
      $app.logger().info(`Status do post ${post.id} atualizado para falhou`, 'post_id', post.id)
    }
    $app.saveNoValidate(post)
  }
})
