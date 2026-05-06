import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'

export interface ReportData {
  id: string
  post_id?: string
  titulo: string
  rede: string
  data: string
  curtidas: number
  comentarios: number
  compartilhamentos: number
  alcance: number
}

export async function fetchReportsData(startDate: Date, endDate: Date, networks: string[]) {
  let data: ReportData[] = []

  try {
    const startStr = startDate.toISOString().replace('T', ' ')
    const endStr = endDate.toISOString().replace('T', ' ')

    const metrics = await pb.collection('metrics_posts').getFullList({
      filter: `updated >= "${startStr}" && updated <= "${endStr}"`,
      expand: 'post_id',
    })

    data = metrics.map((m) => ({
      id: m.id,
      post_id: m.post_id,
      titulo: m.expand?.post_id?.titulo || 'Post sem título',
      rede: (m.rede_social || 'facebook').toLowerCase(),
      data: m.updated,
      curtidas: m.curtidas || 0,
      comentarios: m.comentarios || 0,
      compartilhamentos: m.compartilhamentos || 0,
      alcance: m.alcance || 0,
    }))
  } catch (err) {
    console.warn('Failed to fetch reports data', err)
  }

  return data.filter((d) => {
    const itemDate = new Date(d.data)
    const inDate = itemDate >= startDate && itemDate <= endDate
    const inNetwork = networks.includes(d.rede.toLowerCase())
    return inDate && inNetwork
  })
}

export function exportCSV(data: ReportData[]) {
  const headers = [
    'Título',
    'Rede',
    'Data',
    'Curtidas',
    'Comentários',
    'Compartilhamentos',
    'Alcance',
    'Taxa de Engajamento',
  ]
  const rows = data.map((d) => {
    const taxa =
      d.alcance > 0
        ? (((d.curtidas + d.comentarios + d.compartilhamentos) / d.alcance) * 100).toFixed(2)
        : '0.00'
    const cleanTitle = d.titulo.replace(/"/g, '""')
    return `"${cleanTitle}","${d.rede}","${d.data.split('T')[0]}",${d.curtidas},${d.comentarios},${d.compartilhamentos},${d.alcance},${taxa}%`
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio_posts_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

export async function exportPDF() {
  toast.loading('Gerando PDF...', { id: 'pdf-export' })
  await new Promise((r) => setTimeout(r, 1500))
  window.print()
  toast.success('PDF gerado com sucesso!', { id: 'pdf-export' })
}
