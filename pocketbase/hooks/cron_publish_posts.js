cronAdd('publish_scheduled_posts', '*/1 * * * *', () => {
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
    return // no rows found
  }

  for (const post of posts) {
    $app.logger().info('Starting publication process (CRON)', 'post_id', post.id)
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
      continue
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
        allSuccess = false
        continue
      }

      anyAttempted = true
      let tokenSecretKey = ''
      if (rede === 'facebook') tokenSecretKey = 'FACEBOOK_ACCESS_TOKEN'
      else if (rede === 'instagram') tokenSecretKey = 'INSTAGRAM_ACCESS_TOKEN'
      else if (rede === 'linkedin') tokenSecretKey = 'LINKEDIN_ACCESS_TOKEN'

      const token = $secrets.get(tokenSecretKey)
      if (!token) {
        $app.logger().error(`Secret ${tokenSecretKey} is missing`, 'post_id', post.id, 'rede', rede)
        allSuccess = false
        continue
      }

      $app.logger().info(`Successfully retrieved token for ${rede}`, 'post_id', post.id)

      let url = ''
      let body = {}
      let headers = {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }

      const conteudo = post.getString('conteudo')
      if (!conteudo) {
        $app
          .logger()
          .error(
            `Missing required content for ${rede} (400 Bad Request simulation)`,
            'post_id',
            post.id,
          )
        allSuccess = false
        continue
      }

      if (rede === 'facebook') {
        url = 'https://graph.facebook.com/v19.0/me/feed'
        body = { message: conteudo }
      } else if (rede === 'instagram') {
        url = 'https://graph.facebook.com/v19.0/me/media'
        body = { caption: conteudo, image_url: 'https://img.usecurling.com/p/800/800?q=post' }
      } else if (rede === 'linkedin') {
        url = 'https://api.linkedin.com/v2/ugcPosts'
        body = {
          author: 'urn:li:person:me',
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: conteudo },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        }
      }

      $app
        .logger()
        .info(
          `Sending request to ${rede}`,
          'post_id',
          post.id,
          'url',
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
            `Response from ${rede}`,
            'post_id',
            post.id,
            'status',
            res.statusCode,
            'body',
            JSON.stringify(res.json || {}),
          )

        if (res.statusCode >= 200 && res.statusCode < 300) {
          // ok
        } else if (res.statusCode === 401) {
          $app.logger().error('Token expired/invalid', 'post_id', post.id, 'rede', rede)
          allSuccess = false
        } else if (res.statusCode === 400) {
          $app
            .logger()
            .error(
              'Bad Request, verify if required fields were sent',
              'post_id',
              post.id,
              'rede',
              rede,
            )
          allSuccess = false
        } else if (res.statusCode >= 500) {
          $app.logger().error('Network-side failure (500)', 'post_id', post.id, 'rede', rede)
          allSuccess = false
        } else {
          allSuccess = false
        }
      } catch (err) {
        $app.logger().error(`Exception calling ${rede}`, 'post_id', post.id, 'error', err.message)
        allSuccess = false
      }
    }

    if (anyAttempted && allSuccess) {
      post.set('status', 'publicado')
      post.set('publicado_em', new Date().toISOString().replace('T', ' '))
    } else {
      post.set('status', 'falhou')
    }
    $app.saveNoValidate(post)
  }
})
