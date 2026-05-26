import { useState } from 'react'
import { ReportData } from '@/services/reports'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Edit, Trash2, BarChart2 } from 'lucide-react'
import { PostPerformanceModal } from './PostPerformanceModal'
import { format, parseISO } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function ReportsTable({ data }: { data: ReportData[] }) {
  const [sortCol, setSortCol] = useState<keyof ReportData>('data')
  const [sortDesc, setSortDesc] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)

  if (data.length === 0) return null

  const sorted = [...data].sort((a, b) => {
    let valA = a[sortCol]
    let valB = b[sortCol]
    if (valA < valB) return sortDesc ? 1 : -1
    if (valA > valB) return sortDesc ? -1 : 1
    return 0
  })

  const limit = 10
  const totalPages = Math.ceil(sorted.length / limit)
  const paginated = sorted.slice((page - 1) * limit, page * limit)

  const handleSort = (col: keyof ReportData) => {
    if (sortCol === col) setSortDesc(!sortDesc)
    else {
      setSortCol(col)
      setSortDesc(true)
    }
  }

  const SortIcon = ({ col }: { col: keyof ReportData }) => {
    if (sortCol !== col) return <ChevronDown className="w-4 h-4 opacity-20" />
    return sortDesc ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm mt-6 overflow-hidden break-inside-avoid">
      <div className="overflow-x-auto hidden md:block print:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort('titulo')}
              >
                <div className="flex items-center gap-1">
                  Título <SortIcon col="titulo" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort('rede')}
              >
                <div className="flex items-center gap-1">
                  Rede <SortIcon col="rede" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort('data')}
              >
                <div className="flex items-center gap-1">
                  Data <SortIcon col="data" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort('curtidas')}
              >
                <div className="flex items-center gap-1">
                  Curtidas <SortIcon col="curtidas" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort('comentarios')}
              >
                <div className="flex items-center gap-1">
                  Comentários <SortIcon col="comentarios" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort('compartilhamentos')}
              >
                <div className="flex items-center gap-1">
                  Compartil. <SortIcon col="compartilhamentos" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort('alcance')}
              >
                <div className="flex items-center gap-1">
                  Alcance <SortIcon col="alcance" />
                </div>
              </TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead className="print:hidden">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((d) => {
              const taxa =
                d.alcance > 0
                  ? (
                      ((d.curtidas + d.comentarios + d.compartilhamentos) / d.alcance) *
                      100
                    ).toFixed(1)
                  : '0.0'
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    <div className="flex flex-col gap-1 items-start">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate block cursor-help w-full text-left">
                            {d.titulo}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{d.titulo}</TooltipContent>
                      </Tooltip>
                      {d.isAutomated && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-800">
                          Campanha IA
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{d.rede}</TableCell>
                  <TableCell>{format(parseISO(d.data.split('T')[0]), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{d.curtidas}</TableCell>
                  <TableCell>{d.comentarios}</TableCell>
                  <TableCell>{d.compartilhamentos}</TableCell>
                  <TableCell>{d.alcance}</TableCell>
                  <TableCell>{taxa}%</TableCell>
                  <TableCell className="print:hidden">
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500"
                            onClick={() => setSelectedReport(d)}
                          >
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Desempenho</TooltipContent>
                      </Tooltip>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden p-4 space-y-4 print:hidden">
        {paginated.map((d) => {
          const taxa =
            d.alcance > 0
              ? (((d.curtidas + d.comentarios + d.compartilhamentos) / d.alcance) * 100).toFixed(1)
              : '0.0'
          return (
            <div key={d.id} className="bg-slate-50 p-4 rounded-lg border space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-slate-800 line-clamp-2">{d.titulo}</h4>
                <span className="text-xs px-2 py-1 bg-slate-200 rounded capitalize shrink-0">
                  {d.rede}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {format(parseISO(d.data.split('T')[0]), 'dd/MM/yyyy')}
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs pt-2 border-t">
                <div>
                  <span className="text-slate-400 block">Curtidas</span> {d.curtidas}
                </div>
                <div>
                  <span className="text-slate-400 block">Comentários</span> {d.comentarios}
                </div>
                <div>
                  <span className="text-slate-400 block">Alcance</span> {d.alcance}
                </div>
                <div>
                  <span className="text-slate-400 block">Taxa</span> {taxa}%
                </div>
              </div>
              <div className="pt-2 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-600 gap-1"
                  onClick={() => setSelectedReport(d)}
                >
                  <BarChart2 className="w-4 h-4" />
                  Ver desempenho
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <PostPerformanceModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />

      {totalPages > 1 && (
        <div className="p-4 border-t flex justify-end gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center text-sm px-2">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
