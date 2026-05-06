routerAdd(
  'POST',
  '/backend/v1/backups/export',
  (e) => {
    const auth = e.auth
    if (!auth) return e.unauthorizedError('Not authenticated')

    const body = e.requestInfo().body || {}
    const empresa_id = auth.getString('empresa_id')

    const formato = body.formato || 'json'

    let dataStr = ''
    if (formato === 'json') {
      dataStr = JSON.stringify(
        {
          empresa_id,
          timestamp: new Date().toISOString(),
          export: body.tipos || [],
          periodo: body.periodo,
        },
        null,
        2,
      )
    } else {
      dataStr =
        'empresa_id,timestamp,tipos,periodo\n' +
        `${empresa_id},${new Date().toISOString()},${(body.tipos || []).join('|')},${body.periodo}`
    }

    const bytes = new Uint8Array(dataStr.length)
    for (let i = 0; i < dataStr.length; i++) {
      bytes[i] = dataStr.charCodeAt(i)
    }
    const size = bytes.length

    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    let customExt = ''
    if (body.periodo === 'custom' && body.custom_start && body.custom_end) {
      customExt = `_${body.custom_start}_${body.custom_end}`
    } else {
      customExt = `_${dateStr}`
    }

    const fileName = `backup${customExt}.${formato}`

    const backupsCol = $app.findCollectionByNameOrId('backups')
    const record = new Record(backupsCol)
    record.set('empresa_id', empresa_id)
    record.set('tipo', 'manual')
    record.set('tamanho', size)
    record.set('status', 'sucesso')

    const file = $filesystem.fileFromBytes(bytes, fileName)
    record.set('arquivo_url', file)

    $app.save(record)

    return e.json(200, record)
  },
  $apis.requireAuth(),
)
