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
  const { empresa_id, page_name, site_name, metrics } = body

  const targetSiteName = page_name || site_name

  if (!empresa_id || !targetSiteName || !metrics) {
    return e.badRequestError('Missing required fields: empresa_id, page_name, metrics')
  }

  if (empresa_id !== company.id) {
    return e.forbiddenError('Empresa ID does not match API Key')
  }

  const metricsArray = (Array.isArray(metrics) ? metrics : []).map((m) => {
    let mappedTrend = 'estável'
    const trendRaw = String(m.trend || m.tendencia || '').toLowerCase()
    if (trendRaw === 'up' || trendRaw === 'subindo') mappedTrend = 'subindo'
    else if (trendRaw === 'down' || trendRaw === 'descendo') mappedTrend = 'descendo'

    return {
      metric_name: m.label || m.metric_name || '',
      value: typeof m.value !== 'undefined' ? String(m.value) : '0',
      trend: mappedTrend,
      trend_percentage: String(m.percentage || m.trend_percentage || m.percentual || '').replace(
        '%',
        '',
      ),
    }
  })

  let record
  try {
    record = $app.findFirstRecordByFilter(
      'sponsored_metrics',
      'empresa_id = {:empresa_id} && site_name = {:site_name}',
      { empresa_id: company.id, site_name: targetSiteName },
    )
    record.set('metrics', metricsArray)
  } catch (_) {
    const col = $app.findCollectionByNameOrId('sponsored_metrics')
    record = new Record(col)
    record.set('empresa_id', company.id)
    record.set('site_name', targetSiteName)
    record.set('metrics', metricsArray)
  }

  $app.save(record)

  return e.json(200, { success: true, id: record.id })
})
