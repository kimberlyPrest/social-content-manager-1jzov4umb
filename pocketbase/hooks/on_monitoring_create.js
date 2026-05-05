onRecordAfterCreateSuccess((e) => {
  $app.logger().info(`Monitoramento criado: ${e.record.id}`)
  return e.next()
}, 'monitoring')
