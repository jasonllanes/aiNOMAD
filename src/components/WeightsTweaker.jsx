import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { RotateCcw } from 'lucide-react'

const CRITERIA = [
  { key: 'reliability', label: 'Reliability', color: '#10b981', hint: 'Stability of supply' },
  { key: 'price', label: 'Price / kWh', color: '#3b82f6', hint: 'Lower cost is better' },
  { key: 'capacity', label: 'Capacity', color: '#38bdf8', hint: 'Must meet 120 MW demand' },
  { key: 'outage', label: 'Outage Freq.', color: '#eab308', hint: 'Fewer outages is better' },
  { key: 'peakLoad', label: 'Peak Load', color: '#a855f7', hint: 'High-demand handling' },
  { key: 'flexibility', label: 'Flexibility', color: '#ec4899', hint: 'Contract scaling ease' },
]

export const DEFAULT_RAW_WEIGHTS = {
  reliability: 30,
  price: 25,
  capacity: 15,
  outage: 15,
  peakLoad: 10,
  flexibility: 5,
}

export function WeightsTweaker({ rawWeights, onChange }) {
  const total = Object.values(rawWeights).reduce((a, b) => a + b, 0)
  const isDefault = JSON.stringify(rawWeights) === JSON.stringify(DEFAULT_RAW_WEIGHTS)

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white/70 text-xs uppercase tracking-widest font-semibold">
            Scoring Weights
          </CardTitle>
          {!isDefault && (
            <button
              onClick={() => onChange(DEFAULT_RAW_WEIGHTS)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors border border-white/5"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-1">
        <div className="flex-1 space-y-6">
          {CRITERIA.map(({ key, label, color, hint }) => {
            const effectivePct = total > 0 ? Math.round((rawWeights[key] / total) * 100) : 0
            return (
              <div key={key}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white/75">{label}</p>
                    <p className="text-xs text-white/30">{hint}</p>
                  </div>
                  <span className="text-lg font-extrabold tabular-nums shrink-0" style={{ color }}>
                    {effectivePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={rawWeights[key]}
                  onChange={(e) => onChange({ ...rawWeights, [key]: Number(e.target.value) })}
                  className="w-full h-2 cursor-pointer rounded-full appearance-none"
                  style={{ accentColor: color }}
                />
              </div>
            )
          })}
        </div>

        <div className="mt-6 space-y-2">
          <div className="rounded-xl bg-white/5 px-4 py-3 text-xs text-white/35 leading-relaxed">
            Drag sliders to reprioritize. Values auto-normalize to 100%. Rankings update live.
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3 text-xs text-white/35 leading-relaxed">
            Region: Cagayan de Oro &nbsp;·&nbsp; Demand: 120 MW &nbsp;·&nbsp; Providers: 20
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
