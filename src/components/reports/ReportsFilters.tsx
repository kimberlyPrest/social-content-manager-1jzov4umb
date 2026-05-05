import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

interface ReportsFiltersProps {
  period: string
  setPeriod: (v: string) => void
  customStart: string
  setCustomStart: (v: string) => void
  customEnd: string
  setCustomEnd: (v: string) => void
  networks: string[]
  setNetworks: (v: string[] | ((prev: string[]) => string[])) => void
}

export function ReportsFilters({
  period,
  setPeriod,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  networks,
  setNetworks,
}: ReportsFiltersProps) {
  const toggleNetwork = (net: string) => {
    setNetworks((prev: string[]) =>
      prev.includes(net) ? prev.filter((n) => n !== net) : [...prev, net],
    )
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4 print:hidden">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <h3 className="font-semibold text-sm text-slate-700">Período</h3>
          <RadioGroup value={period} onValueChange={setPeriod} className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="7" id="p-7" />
              <Label htmlFor="p-7">Últimos 7 dias</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30" id="p-30" />
              <Label htmlFor="p-30">Últimos 30 dias</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="90" id="p-90" />
              <Label htmlFor="p-90">Últimos 90 dias</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="p-c" />
              <Label htmlFor="p-c">Customizado</Label>
            </div>
          </RadioGroup>
          {period === 'custom' && (
            <div className="flex gap-2 items-center mt-2">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-auto h-9 text-sm"
              />
              <span className="text-sm text-slate-500">até</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-auto h-9 text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <h3 className="font-semibold text-sm text-slate-700">Redes Sociais</h3>
          <div className="flex flex-wrap gap-4">
            {['facebook', 'instagram', 'linkedin', 'tiktok'].map((net) => (
              <div key={net} className="flex items-center space-x-2">
                <Checkbox
                  id={`net-${net}`}
                  checked={networks.includes(net)}
                  onCheckedChange={() => toggleNetwork(net)}
                />
                <Label htmlFor={`net-${net}`} className="capitalize">
                  {net}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
