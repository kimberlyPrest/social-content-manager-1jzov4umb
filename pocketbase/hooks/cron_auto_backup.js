cronAdd('auto_backup', '0 * * * *', () => {
  const now = new Date()
  const hour = now.getHours().toString().padStart(2, '0') + ':00'

  const configs = $app.findRecordsByFilter(
    'configuracao_backup',
    'ativo = true && horario = {:hour}',
    '',
    1000,
    0,
    { hour: hour },
  )

  for (let i = 0; i < configs.length; i++) {
    const cfg = configs[i]
    try {
      const empresa_id = cfg.getString('empresa_id')
      const dataStr = JSON.stringify({
        auto_backup: true,
        timestamp: now.toISOString(),
        empresa_id,
      })

      const bytes = new Uint8Array(dataStr.length)
      for (let j = 0; j < dataStr.length; j++) {
        bytes[j] = dataStr.charCodeAt(j)
      }

      const dateStr = now.toISOString().split('T')[0]
      const fileName = `backup_auto_${dateStr}.json`

      const backupsCol = $app.findCollectionByNameOrId('backups')
      const record = new Record(backupsCol)
      record.set('empresa_id', empresa_id)
      record.set('tipo', 'automatico')
      record.set('tamanho', bytes.length)
      record.set('status', 'sucesso')

      const file = $filesystem.fileFromBytes(bytes, fileName)
      record.set('arquivo_url', file)

      $app.save(record)
    } catch (err) {
      $app
        .logger()
        .error(
          'Auto backup failed',
          'empresa_id',
          cfg.getString('empresa_id'),
          'error',
          err.message,
        )
    }
  }
})
