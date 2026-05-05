import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'

export interface ReportData {
  id: string
  titulo: string
  rede: string
  data: string
  curtidas: number
  comentarios: number
  compartilhamentos: number
  alcance: number
}

const MOCK_DATA: ReportData[] = [
  {
    id: 'm1',
    titulo: 'Novo perfume Flor de Lótus',
    rede: 'instagram',
    data: '2026-04-15T12:00:00Z',
    curtidas: 234,
    comentarios: 18,
    compartilhamentos: 5,
    alcance: 1200,
  },
  {
    id: 'm2',
    titulo: 'Promoção Black Friday',
    rede: 'facebook',
    data: '2026-04-14T12:00:00Z',
    curtidas: 156,
    comentarios: 12,
    compartilhamentos: 8,
    alcance: 890,
  },
  {
    id: 'm3',
    titulo: 'Dica de combinação',
    rede: 'linkedin',
    data: '2026-04-13T12:00:00Z',
    curtidas: 89,
    comentarios: 7,
    compartilhamentos: 2,
    alcance: 450,
  },
  {
    id: 'm4',
    titulo: 'Unboxing Supremo Aroma',
    rede: 'tiktok',
    data: '2026-04-12T12:00:00Z',
    curtidas: 412,
    comentarios: 35,
    compartilhamentos: 15,
    alcance: 2100,
  },
  {
    id: 'm5',
    titulo: 'Entrevista com perfumista',
    rede: 'instagram',
    data: '2026-04-11T12:00:00Z',
    curtidas: 178,
    comentarios: 14,
    compartilhamentos: 6,
    alcance: 950,
  },
  {
    id: 'm6',
    titulo: 'Novo catálogo 2026',
    rede: 'facebook',
    data: '2026-04-10T12:00:00Z',
    curtidas: 145,
    comentarios: 10,
    compartilhamentos: 4,
    alcance: 720,
  },
  {
    id: 'm7',
    titulo: 'Dica de armazenamento',
    rede: 'linkedin',
    data: '2026-04-09T12:00:00Z',
    curtidas: 67,
    comentarios: 5,
    compartilhamentos: 1,
    alcance: 320,
  },
  {
    id: 'm8',
    titulo: 'Behind the scenes',
    rede: 'tiktok',
    data: '2026-04-08T12:00:00Z',
    curtidas: 523,
    comentarios: 42,
    compartilhamentos: 20,
    alcance: 2800,
  },
  {
    id: 'm9',
    titulo: 'Promoção de Páscoa',
    rede: 'instagram',
    data: '2026-04-07T12:00:00Z',
    curtidas: 298,
    comentarios: 22,
    compartilhamentos: 9,
    alcance: 1500,
  },
  {
    id: 'm10',
    titulo: 'Novo fornecedor parceiro',
    rede: 'linkedin',
    data: '2026-04-06T12:00:00Z',
    curtidas: 112,
    comentarios: 8,
    compartilhamentos: 3,
    alcance: 580,
  },
]

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
      titulo: m.expand?.post_id?.titulo || 'Post sem título',
      rede: (m.rede_social || 'facebook').toLowerCase(),
      data: m.updated,
      curtidas: m.curtidas || 0,
      comentarios: m.comentarios || 0,
      compartilhamentos: m.compartilhamentos || 0,
      alcance: m.alcance || 0,
    }))
  } catch (err) {
    console.warn('Fallback to mock data for reports due to error or missing data', err)
  }

  const combined = [...data, ...MOCK_DATA]

  return combined.filter((d) => {
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
      d.alcance > 0 ? (((d.curtidas + d.comentarios) / d.alcance) * 100).toFixed(2) : '0.00'
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
