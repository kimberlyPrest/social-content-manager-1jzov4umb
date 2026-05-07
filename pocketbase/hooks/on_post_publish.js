onRecordAfterCreateSuccess((e) => {
  const post = e.record
  const status = post.getString('status')
  if (status !== 'agendado') return e.next()

  const agendadoPara = post.getString('agendado_para')
  if (agendadoPara) {
    const agendadoDate = new Date(agendadoPara.replace(' ', 'T'))
    const now = new Date()
    if (agendadoDate > now) {
      return e.next()
    }
  }

  $app.logger().info(`[PUBLISH_START] Initiation of the publication process`, 'post_id', post.id)
  console.log('Iniciando publicação do post:', post.id)

  let allSuccess = true
  let anyAttempted = false
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
    return e.next()
  }

  const titulo = post.getString('titulo')
  const conteudo = post.getString('conteudo')
  const imagens = post.get('imagens')
  const hasImages = imagens && (Array.isArray(imagens) ? imagens.length > 0 : imagens !== '')

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

    $app
      .logger()
      .info(`[TOKEN_RETRIEVAL] Attempting to retrieve token for ${rede}`, 'post_id', post.id)

    let instagramBusinessId = ''
    if (rede === 'instagram') {
      try {
        const company = $app.findRecordById('companies', post.getString('empresa_id'))
        instagramBusinessId = company.getString('instagram_business_id')
      } catch (_) {}
      if (!instagramBusinessId) instagramBusinessId = $secrets.get('INSTAGRAM_ID')
      if (!instagramBusinessId) {
        $app
          .logger()
          .error(
            `[INSTAGRAM_CONFIG_ERROR] Instagram Business Account ID não configurado`,
            'post_id',
            post.id,
            'rede',
            rede,
          )
        allSuccess = false
        continue
      }
    }

    let token = integracao ? integracao.getString('access_token') : ''
    let tokenSecretKey = ''

    if (!token) {
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

    $app
      .logger()
      .info(`[TOKEN_SUCCESS] Successfully retrieved token for ${rede}`, 'post_id', post.id)
    console.log('Token lido:', integracao ? `integracao_${rede}` : tokenSecretKey)

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

    if (rede === 'facebook') {
      url = 'https://graph.facebook.com/v25.0/me/feed'
      body = { message: fullText }
    } else if (rede === 'instagram') {
      if (!hasImages) {
        $app.logger().warn('[INSTAGRAM_NO_IMAGE]', 'post_id', post.id)
        allSuccess = false
        continue
      }

      const imageName = Array.isArray(imagens) ? imagens[0] : imagens
      const baseUrl =
        $os.getenv('VITE_POCKETBASE_URL') ||
        'https://social-content-manager-7c8af.shrd00.internal.goskip.dev'
      const realImageUrl = `${baseUrl}/api/files/${post.collectionId}/${post.id}/${imageName}`

      // Step 1: Create Media Container
      const step1Url = `https://graph.facebook.com/v25.0/${instagramBusinessId}/media`
      const step1Body = {
        image_url: realImageUrl,
        caption: fullText,
        access_token: token,
      }

      $app
        .logger()
        .info(
          `[INSTAGRAM_STEP1_REQUEST] Sending request to ${rede}`,
          'post_id',
          post.id,
          'endpoint',
          step1Url,
          'payload',
          JSON.stringify(step1Body),
        )
      console.log('Chamando API:', step1Url, 'com dados:', step1Body)

      let creationId = null
      try {
        const res1 = $http.send({
          url: step1Url,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(step1Body),
          timeout: 30,
        })

        $app
          .logger()
          .info(
            `[INSTAGRAM_STEP1]`,
            'post_id',
            post.id,
            'status',
            res1.statusCode,
            'body',
            JSON.stringify(res1.json || {}),
          )
        console.log('Resposta da API (Step 1):', res1.json || {})

        if (res1.statusCode >= 200 && res1.statusCode < 300 && res1.json && res1.json.id) {
          creationId = res1.json.id
        } else if (res1.statusCode === 401) {
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
        } else if (res1.statusCode === 400) {
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
        } else if (res1.statusCode >= 500) {
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
        } else {
          allSuccess = false
        }
      } catch (err) {
        $app
          .logger()
          .error(
            `[API_EXCEPTION] Exception calling ${rede} step 1`,
            'post_id',
            post.id,
            'error',
            err.message,
          )
        console.error('Erro ao publicar step 1:', err.message, err)
        allSuccess = false
      }

      if (!creationId) {
        continue
      }

      // Step 2: Publish Media Container
      const step2Url = `https://graph.facebook.com/v25.0/${instagramBusinessId}/media_publish`
      const step2Body = {
        creation_id: creationId,
        access_token: token,
      }

      $app
        .logger()
        .info(
          `[INSTAGRAM_STEP2_REQUEST] Sending request to ${rede}`,
          'post_id',
          post.id,
          'endpoint',
          step2Url,
          'payload',
          JSON.stringify(step2Body),
        )
      console.log('Chamando API:', step2Url, 'com dados:', step2Body)

      try {
        const res2 = $http.send({
          url: step2Url,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(step2Body),
          timeout: 30,
        })

        $app
          .logger()
          .info(
            `[INSTAGRAM_STEP2]`,
            'post_id',
            post.id,
            'status',
            res2.statusCode,
            'body',
            JSON.stringify(res2.json || {}),
          )
        console.log('Resposta da API (Step 2):', res2.json || {})

        if (res2.statusCode >= 200 && res2.statusCode < 300 && res2.json && res2.json.id) {
          post.set('id_externo_instagram', res2.json.id)
        } else if (res2.statusCode === 401) {
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
        } else if (res2.statusCode === 400) {
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
        } else if (res2.statusCode >= 500) {
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
        } else {
          allSuccess = false
        }
      } catch (err) {
        $app
          .logger()
          .error(
            `[API_EXCEPTION] Exception calling ${rede} step 2`,
            'post_id',
            post.id,
            'error',
            err.message,
          )
        console.error('Erro ao publicar step 2:', err.message, err)
        allSuccess = false
      }

      continue
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
        `[API_REQUEST] Sending request to ${rede}`,
        'post_id',
        post.id,
        'endpoint',
        url,
        'payload',
        JSON.stringify(body),
      )
    console.log('Chamando API:', url, 'com dados:', body)

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
          `[API_RESPONSE] Response from ${rede}`,
          'post_id',
          post.id,
          'status',
          res.statusCode,
          'body',
          JSON.stringify(res.json || {}),
        )
      console.log('Resposta da API:', res.json || {})

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
      console.error('Erro ao publicar:', err.message, err)
      allSuccess = false
    }
  }

  if (anyAttempted && allSuccess) {
    post.set('status', 'publicado')
    post.set('publicado_em', new Date().toISOString().replace('T', ' '))
    try {
      const atividades = $app.findCollectionByNameOrId('atividades')
      const record = new Record(atividades)
      record.set('empresa_id', post.getString('empresa_id'))
      record.set('usuario_id', post.getString('criador_id'))
      record.set('tipo', 'post_publicado')
      record.set('descricao', 'O post foi publicado com sucesso pelas redes sociais conectadas.')
      record.set('referencia_id', post.id)
      $app.saveNoValidate(record)
    } catch (err) {
      $app.logger().warn('Failed to create atividade', 'error', err.message)
    }
  } else {
    post.set('status', 'falhou')
  }
  $app.saveNoValidate(post)

  return e.next()
}, 'posts')

onRecordAfterUpdateSuccess((e) => {
  const post = e.record
  const status = post.getString('status')
  if (status !== 'agendado') return e.next()

  const agendadoPara = post.getString('agendado_para')
  if (agendadoPara) {
    const agendadoDate = new Date(agendadoPara.replace(' ', 'T'))
    const now = new Date()
    if (agendadoDate > now) {
      return e.next()
    }
  }

  $app.logger().info(`[PUBLISH_START] Initiation of the publication process`, 'post_id', post.id)
  console.log('Iniciando publicação do post:', post.id)

  let allSuccess = true
  let anyAttempted = false
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
    return e.next()
  }

  const titulo = post.getString('titulo')
  const conteudo = post.getString('conteudo')
  const imagens = post.get('imagens')
  const hasImages = imagens && (Array.isArray(imagens) ? imagens.length > 0 : imagens !== '')

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

    $app
      .logger()
      .info(`[TOKEN_RETRIEVAL] Attempting to retrieve token for ${rede}`, 'post_id', post.id)

    let instagramBusinessId = ''
    if (rede === 'instagram') {
      try {
        const company = $app.findRecordById('companies', post.getString('empresa_id'))
        instagramBusinessId = company.getString('instagram_business_id')
      } catch (_) {}
      if (!instagramBusinessId) instagramBusinessId = $secrets.get('INSTAGRAM_ID')
      if (!instagramBusinessId) {
        $app
          .logger()
          .error(
            `[INSTAGRAM_CONFIG_ERROR] Instagram Business Account ID não configurado`,
            'post_id',
            post.id,
            'rede',
            rede,
          )
        allSuccess = false
        continue
      }
    }

    let token = integracao ? integracao.getString('access_token') : ''
    let tokenSecretKey = ''

    if (!token) {
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

    $app
      .logger()
      .info(`[TOKEN_SUCCESS] Successfully retrieved token for ${rede}`, 'post_id', post.id)
    console.log('Token lido:', integracao ? `integracao_${rede}` : tokenSecretKey)

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

    if (rede === 'facebook') {
      url = 'https://graph.facebook.com/v25.0/me/feed'
      body = { message: fullText }
    } else if (rede === 'instagram') {
      if (!hasImages) {
        $app.logger().warn('[INSTAGRAM_NO_IMAGE]', 'post_id', post.id)
        allSuccess = false
        continue
      }

      const imageName = Array.isArray(imagens) ? imagens[0] : imagens
      const baseUrl =
        $os.getenv('VITE_POCKETBASE_URL') ||
        'https://social-content-manager-7c8af.shrd00.internal.goskip.dev'
      const realImageUrl = `${baseUrl}/api/files/${post.collectionId}/${post.id}/${imageName}`

      // Step 1: Create Media Container
      const step1Url = `https://graph.facebook.com/v25.0/${instagramBusinessId}/media`
      const step1Body = {
        image_url: realImageUrl,
        caption: fullText,
        access_token: token,
      }

      $app
        .logger()
        .info(
          `[INSTAGRAM_STEP1_REQUEST] Sending request to ${rede}`,
          'post_id',
          post.id,
          'endpoint',
          step1Url,
          'payload',
          JSON.stringify(step1Body),
        )
      console.log('Chamando API:', step1Url, 'com dados:', step1Body)

      let creationId = null
      try {
        const res1 = $http.send({
          url: step1Url,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(step1Body),
          timeout: 30,
        })

        $app
          .logger()
          .info(
            `[INSTAGRAM_STEP1]`,
            'post_id',
            post.id,
            'status',
            res1.statusCode,
            'body',
            JSON.stringify(res1.json || {}),
          )
        console.log('Resposta da API (Step 1):', res1.json || {})

        if (res1.statusCode >= 200 && res1.statusCode < 300 && res1.json && res1.json.id) {
          creationId = res1.json.id
        } else if (res1.statusCode === 401) {
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
        } else if (res1.statusCode === 400) {
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
        } else if (res1.statusCode >= 500) {
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
        } else {
          allSuccess = false
        }
      } catch (err) {
        $app
          .logger()
          .error(
            `[API_EXCEPTION] Exception calling ${rede} step 1`,
            'post_id',
            post.id,
            'error',
            err.message,
          )
        console.error('Erro ao publicar step 1:', err.message, err)
        allSuccess = false
      }

      if (!creationId) {
        continue
      }

      // Step 2: Publish Media Container
      const step2Url = `https://graph.facebook.com/v25.0/${instagramBusinessId}/media_publish`
      const step2Body = {
        creation_id: creationId,
        access_token: token,
      }

      $app
        .logger()
        .info(
          `[INSTAGRAM_STEP2_REQUEST] Sending request to ${rede}`,
          'post_id',
          post.id,
          'endpoint',
          step2Url,
          'payload',
          JSON.stringify(step2Body),
        )
      console.log('Chamando API:', step2Url, 'com dados:', step2Body)

      try {
        const res2 = $http.send({
          url: step2Url,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(step2Body),
          timeout: 30,
        })

        $app
          .logger()
          .info(
            `[INSTAGRAM_STEP2]`,
            'post_id',
            post.id,
            'status',
            res2.statusCode,
            'body',
            JSON.stringify(res2.json || {}),
          )
        console.log('Resposta da API (Step 2):', res2.json || {})

        if (res2.statusCode >= 200 && res2.statusCode < 300 && res2.json && res2.json.id) {
          post.set('id_externo_instagram', res2.json.id)
        } else if (res2.statusCode === 401) {
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
        } else if (res2.statusCode === 400) {
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
        } else if (res2.statusCode >= 500) {
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
        } else {
          allSuccess = false
        }
      } catch (err) {
        $app
          .logger()
          .error(
            `[API_EXCEPTION] Exception calling ${rede} step 2`,
            'post_id',
            post.id,
            'error',
            err.message,
          )
        console.error('Erro ao publicar step 2:', err.message, err)
        allSuccess = false
      }

      continue
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
        `[API_REQUEST] Sending request to ${rede}`,
        'post_id',
        post.id,
        'endpoint',
        url,
        'payload',
        JSON.stringify(body),
      )
    console.log('Chamando API:', url, 'com dados:', body)

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
          `[API_RESPONSE] Response from ${rede}`,
          'post_id',
          post.id,
          'status',
          res.statusCode,
          'body',
          JSON.stringify(res.json || {}),
        )
      console.log('Resposta da API:', res.json || {})

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
      console.error('Erro ao publicar:', err.message, err)
      allSuccess = false
    }
  }

  if (anyAttempted && allSuccess) {
    post.set('status', 'publicado')
    post.set('publicado_em', new Date().toISOString().replace('T', ' '))
    try {
      const atividades = $app.findCollectionByNameOrId('atividades')
      const record = new Record(atividades)
      record.set('empresa_id', post.getString('empresa_id'))
      record.set('usuario_id', post.getString('criador_id'))
      record.set('tipo', 'post_publicado')
      record.set('descricao', 'O post foi publicado com sucesso pelas redes sociais conectadas.')
      record.set('referencia_id', post.id)
      $app.saveNoValidate(record)
    } catch (err) {
      $app.logger().warn('Failed to create atividade', 'error', err.message)
    }
  } else {
    post.set('status', 'falhou')
  }
  $app.saveNoValidate(post)

  return e.next()
}, 'posts')
