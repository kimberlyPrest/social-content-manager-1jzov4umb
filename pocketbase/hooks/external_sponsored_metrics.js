routerAdd('POST', '/backend/v1/external/sponsored-metrics', (e) => {
  const apiKey = e.request.header.get('X-Api-Key') || e.requestInfo().headers['x_api_key']
  if (!apiKey) {
    return e.unauthorizedError('Missing X-Api-Key header')
  }

  let company
  try {
    company = $app.findFirstRecordByData('companies', 'api_key', apiKey)
  } catch (_) {
    return e.unauthorizedError('Invalid API Key')
  }

  const body = e.requestInfo().body || {}
  const { empresa_id, site_name, metrics } = body

  if (!empresa_id || !site_name || !metrics) {
    return e.badRequestError('Missing required fields: empresa_id, site_name, metrics')
  }

  if (empresa_id !== company.id) {
    return e.forbiddenError('Empresa ID does not match API Key')
  }

  const { roas, lucro_estimado, total_plays, tendencia, percentual } = metrics

  const trendMap = {
    up: 'subindo',
    down: 'descendo',
    stable: 'estável',
  }
  const mappedTrend = trendMap[String(tendencia).toLowerCase()] || 'estável'
  const numPercentual = Number(percentual) || 0

  const metricsArray = [
    {
      metric_name: 'ROAS',
      value: Number(roas) || 0,
      trend: mappedTrend,
      trend_percentage: numPercentual,
    },
    {
      metric_name: 'Lucro Estimado',
      value: Number(lucro_estimado) || 0,
      trend: mappedTrend,
      trend_percentage: numPercentual,
    },
    {
      metric_name: 'Total Plays',
      value: Number(total_plays) || 0,
      trend: mappedTrend,
      trend_percentage: numPercentual,
    },
  ]

  let record
  try {
    record = $app.findFirstRecordByFilter(
      'sponsored_metrics',
      'empresa_id = {:empresa_id} && site_name = {:site_name}',
      { empresa_id: company.id, site_name: site_name },
    )
    record.set('metrics', metricsArray)
  } catch (_) {
    const col = $app.findCollectionByNameOrId('sponsored_metrics')
    record = new Record(col)
    record.set('empresa_id', company.id)
    record.set('site_name', site_name)
    record.set('metrics', metricsArray)
  }

  $app.save(record)

  return e.json(200, { success: true, id: record.id })
})
