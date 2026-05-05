migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('notifications')
    const tipoField = col.fields.getByName('tipo')
    if (tipoField) {
      tipoField.values = [
        'post_publicado',
        'comentario',
        'mencao',
        'teste_finalizado',
        'post_agendado',
        'post_aprovado',
        'membro_adicionado',
      ]
    }
    if (!col.fields.getByName('referencia_id')) {
      col.fields.add(new TextField({ name: 'referencia_id' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('notifications')
    const tipoField = col.fields.getByName('tipo')
    if (tipoField) {
      tipoField.values = ['post_publicado', 'comentario', 'mencao', 'teste_finalizado']
    }
    if (col.fields.getByName('referencia_id')) {
      col.fields.removeByName('referencia_id')
    }
    app.save(col)
  },
)
