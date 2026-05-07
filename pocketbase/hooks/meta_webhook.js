// ─────────────────────────────────────────────────────────
// GET /backend/v1/meta/webhook  →  Verificação do webhook pela Meta
//
// No painel Meta for Developers, configure:
//   Callback URL  : https://{seu-dominio}/backend/v1/meta/webhook
//   Verify Token  : o valor definido no secret WEBHOOK_VERIFY_TOKEN
//
// Inscrições de campo recomendadas: messages, messaging_postbacks,
//   story_insights, comments, mentions
// ─────────────────────────────────────────────────────────
routerAdd('GET', '/backend/v1/meta/webhook', (e) => {
  const rawQuery = (e.request.url.rawQuery || '').toString()
  const params = {}
  rawQuery.split('&').forEach((pair) => {
    const eq = pair.indexOf('=')
    if (eq > -1) {
      try {
        params[decodeURIComponent(pair.slice(0, eq))] = decodeURIComponent(pair.slice(eq + 1))
      } catch (_) {}
    }
  })

  const mode = params['hub.mode']
  const challenge = params['hub.challenge'] || ''
  const token = params['hub.verify_token']

  const verifyToken = $secrets.get('WEBHOOK_VERIFY_TOKEN')

  $app
    .logger()
    .info('[META_WEBHOOK] Verificação recebida', 'mode', mode, 'tokenMatch', token === verifyToken)

  if (mode === 'subscribe' && token === verifyToken) {
    return e.string(200, challenge)
  }

  return e.json(403, { error: 'Verificação falhou: token inválido' })
})

// ─────────────────────────────────────────────────────────
// POST /backend/v1/meta/webhook  →  Recebimento de eventos
// ─────────────────────────────────────────────────────────
routerAdd('POST', '/backend/v1/meta/webhook', (e) => {
  let payload = {}
  try {
    payload = e.requestInfo().body || {}
  } catch (err) {
    $app.logger().error('[META_WEBHOOK] Falha ao ler body', 'error', err.message)
    return e.json(200, { ok: true }) // sempre 200 para a Meta não retentar
  }

  $app.logger().info('[META_WEBHOOK] Evento recebido', 'object', payload.object)

  if (payload.object !== 'instagram') {
    return e.json(200, { ok: true })
  }

  // Encontra a empresa com Instagram conectado
  let empresaId = ''
  try {
    const integ = $app.findFirstRecordByFilter(
      'integracao_redes',
      "rede_social = 'instagram' && status = 'conectado'",
    )
    empresaId = integ.getString('empresa_id')
  } catch (_) {
    $app.logger().warn('[META_WEBHOOK] Nenhuma integração Instagram conectada encontrada')
    return e.json(200, { ok: true })
  }

  const entries = payload.entry || []
  for (const entry of entries) {
    // Mensagens diretas (DMs)
    const messaging = entry.messaging || []
    for (const msg of messaging) {
      _processarMensagem(empresaId, msg)
    }

    // Mudanças: comentários, menções, etc.
    const changes = entry.changes || []
    for (const change of changes) {
      _processarMudanca(empresaId, change)
    }
  }

  return e.json(200, { ok: true })
})

// ─────────────────────────────────────────────────────────
// Processa um evento de DM recebido
// ─────────────────────────────────────────────────────────
function _processarMensagem(empresaId, msg) {
  const senderId = (msg.sender && msg.sender.id) || ''
  const timestamp = msg.timestamp
    ? new Date(msg.timestamp * 1000).toISOString().replace('T', ' ')
    : new Date().toISOString().replace('T', ' ')
  const message = msg.message || {}
  const igMsgId = message.mid || ''

  if (!senderId || !igMsgId || message.is_deleted) return

  // Deduplicação por ig_message_id
  try {
    $app.findFirstRecordByFilter('mensagens_instagram', 'ig_message_id = {:mid}', { mid: igMsgId })
    return // já existe
  } catch (_) {}

  // Determina tipo e conteúdo
  let tipo = 'texto'
  let conteudo = message.text || ''
  let midiaUrl = ''

  const attachments = message.attachments || []
  if (attachments.length > 0) {
    const att = attachments[0]
    const attUrl = (att.payload && att.payload.url) || ''
    if (att.type === 'story_mention') {
      tipo = 'story_mention'
      midiaUrl = attUrl
      conteudo = '[Mencionou você nos Stories]'
    } else if (att.type === 'story_reply') {
      tipo = 'story_reply'
      midiaUrl = attUrl
      conteudo = message.text || '[Respondeu ao seu Story]'
    } else if (att.type === 'image') {
      tipo = 'imagem'
      midiaUrl = attUrl
      conteudo = '[Imagem]'
    } else if (att.type === 'video') {
      tipo = 'video'
      midiaUrl = attUrl
      conteudo = '[Vídeo]'
    } else if (att.type === 'like') {
      tipo = 'reacao'
      conteudo = '❤️'
    } else {
      tipo = 'outro'
      conteudo = '[' + att.type + ']'
    }
  }

  // Busca ou cria a conversa
  let conversa
  let conversaIsNew = false
  try {
    conversa = $app.findFirstRecordByFilter(
      'conversas_instagram',
      'empresa_id = {:eid} && ig_user_id = {:uid}',
      { eid: empresaId, uid: senderId },
    )
  } catch (_) {
    const col = $app.findCollectionByNameOrId('conversas_instagram')
    conversa = new Record(col)
    conversa.set('empresa_id', empresaId)
    conversa.set('ig_user_id', senderId)
    conversa.set('ig_username', '')
    conversa.set('ig_name', senderId)
    conversa.set('nao_lidas', 0)
    conversa.set('status', 'aberta')
    conversaIsNew = true
  }

  conversa.set('ultima_mensagem', conteudo.substring(0, 100))
  conversa.set('ultima_mensagem_em', timestamp)
  conversa.set('status', 'aberta')
  const naoLidas = (conversa.getInt('nao_lidas') || 0) + 1
  conversa.set('nao_lidas', naoLidas)

  try {
    $app.saveNoValidate(conversa)

    const msgCol = $app.findCollectionByNameOrId('mensagens_instagram')
    const msgRecord = new Record(msgCol)
    msgRecord.set('conversa_id', conversa.id)
    msgRecord.set('empresa_id', empresaId)
    msgRecord.set('ig_message_id', igMsgId)
    msgRecord.set('origem', 'recebida')
    msgRecord.set('conteudo', conteudo)
    msgRecord.set('tipo', tipo)
    msgRecord.set('midia_url', midiaUrl)
    msgRecord.set('recebida_em', timestamp)
    msgRecord.set('lida', false)
    $app.saveNoValidate(msgRecord)

    $app
      .logger()
      .info(
        '[META_WEBHOOK] Mensagem salva',
        'sender',
        senderId,
        'tipo',
        tipo,
        'conversa_nova',
        conversaIsNew,
      )
  } catch (err) {
    $app.logger().error('[META_WEBHOOK] Falha ao salvar mensagem', 'error', err.message)
  }
}

// ─────────────────────────────────────────────────────────
// Processa eventos de changes (comentários, menções, etc.)
// Estrutura pronta para expansão futura
// ─────────────────────────────────────────────────────────
function _processarMudanca(empresaId, change) {
  const field = change.field
  const value = change.value || {}

  $app.logger().info('[META_WEBHOOK] Change event', 'field', field, 'empresa_id', empresaId)

  if (field === 'comments') {
    $app
      .logger()
      .info(
        '[META_WEBHOOK] Comentário recebido',
        'comment_id',
        value.id,
        'text',
        (value.text || '').substring(0, 100),
      )
    // TODO: criar registro em posts_monitorados ou notificar
  } else if (field === 'mentions') {
    $app.logger().info('[META_WEBHOOK] Menção recebida', 'media_id', value.media_id)
    // TODO: criar registro em posts_monitorados
  } else if (field === 'story_insights') {
    $app.logger().info('[META_WEBHOOK] Story insight recebido', 'value', JSON.stringify(value))
  }
}
