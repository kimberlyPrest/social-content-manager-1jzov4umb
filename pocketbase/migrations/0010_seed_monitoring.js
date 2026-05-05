migrate(
  (app) => {
    let user
    try {
      user = app.findFirstRecordByData('_pb_users_auth_', 'email', 'eduardo@supremoaroma.com.br')
    } catch (_) {
      return // user not found, skip seed
    }
    const empresa_id = user.get('empresa_id')

    const monitoringRules = [
      {
        tipo: 'hashtag',
        valor: '#supremoaroma',
        rede_social: 'Instagram, Facebook, TikTok',
        ativo: true,
      },
      {
        tipo: 'palavra_chave',
        valor: 'perfume natural',
        rede_social: 'Instagram, LinkedIn',
        ativo: true,
      },
      {
        tipo: 'mencao',
        valor: '@supremoaroma',
        rede_social: 'Facebook, Instagram, LinkedIn',
        ativo: true,
      },
      { tipo: 'concorrente', valor: 'Natura', rede_social: 'Instagram, Facebook', ativo: true },
    ]

    const colMonitoring = app.findCollectionByNameOrId('monitoring')
    const createdRules = []

    for (const rule of monitoringRules) {
      try {
        const existing = app.findFirstRecordByData('monitoring', 'valor', rule.valor)
        createdRules.push(existing)
      } catch (_) {
        const record = new Record(colMonitoring)
        record.set('empresa_id', empresa_id)
        record.set('tipo', rule.tipo)
        record.set('valor', rule.valor)
        record.set('rede_social', rule.rede_social)
        record.set('ativo', rule.ativo)
        app.save(record)
        createdRules.push(record)
      }
    }

    const postsData = [
      {
        autor: '@usuario1',
        conteudo: 'Adorei o perfume Flor de Lótus! 🌸',
        rede_social: 'instagram',
        curtidas: 45,
        monitoramento_id: createdRules[0].id,
      },
      {
        autor: '@usuario2',
        conteudo: 'Unboxing Supremo Aroma',
        rede_social: 'tiktok',
        curtidas: 120,
        monitoramento_id: createdRules[0].id,
      },
      {
        autor: '@usuario3',
        conteudo: 'Recomendo Supremo Aroma',
        rede_social: 'linkedin',
        curtidas: 23,
        monitoramento_id: createdRules[2].id,
      },
      {
        autor: '@usuario4',
        conteudo: 'Melhor fragrância que já usei',
        rede_social: 'facebook',
        curtidas: 67,
        monitoramento_id: createdRules[1].id,
      },
      {
        autor: '@usuario5',
        conteudo: 'Novo favorito',
        rede_social: 'instagram',
        curtidas: 89,
        monitoramento_id: createdRules[3].id,
      },
    ]

    const colPosts = app.findCollectionByNameOrId('posts_monitorados')

    for (const p of postsData) {
      try {
        app.findFirstRecordByData('posts_monitorados', 'conteudo', p.conteudo)
      } catch (_) {
        const record = new Record(colPosts)
        record.set('empresa_id', empresa_id)
        record.set('monitoramento_id', p.monitoramento_id)
        record.set('autor', p.autor)
        record.set('rede_social', p.rede_social)
        record.set('conteudo', p.conteudo)
        record.set('curtidas', p.curtidas)
        record.set('comentarios', 0)
        record.set('compartilhamentos', 0)
        app.save(record)
      }
    }
  },
  (app) => {
    // no-op down migration for seeds
  },
)
