migrate(
  (app) => {
    // conversas_instagram: uma thread por usuário que envia DM
    const conversas = new Collection({
      name: 'conversas_instagram',
      type: 'base',
      fields: [
        new TextField({ name: 'empresa_id', required: true }),
        new TextField({ name: 'ig_user_id', required: true }),
        new TextField({ name: 'ig_username' }),
        new TextField({ name: 'ig_name' }),
        new TextField({ name: 'ultima_mensagem' }),
        new DateField({ name: 'ultima_mensagem_em' }),
        new NumberField({ name: 'nao_lidas' }),
        new SelectField({
          name: 'status',
          values: ['aberta', 'fechada', 'arquivada'],
          maxSelect: 1,
        }),
      ],
    })
    app.save(conversas)

    // mensagens_instagram: mensagens individuais de cada conversa
    const mensagens = new Collection({
      name: 'mensagens_instagram',
      type: 'base',
      fields: [
        new TextField({ name: 'conversa_id', required: true }),
        new TextField({ name: 'empresa_id', required: true }),
        new TextField({ name: 'ig_message_id' }),
        new SelectField({
          name: 'origem',
          values: ['recebida', 'enviada'],
          maxSelect: 1,
        }),
        new TextField({ name: 'conteudo' }),
        new SelectField({
          name: 'tipo',
          values: ['texto', 'imagem', 'video', 'story_mention', 'story_reply', 'reacao', 'outro'],
          maxSelect: 1,
        }),
        new TextField({ name: 'midia_url' }),
        new DateField({ name: 'recebida_em' }),
        new BoolField({ name: 'lida' }),
      ],
    })
    app.save(mensagens)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('mensagens_instagram'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('conversas_instagram'))
    } catch (_) {}
  },
)
