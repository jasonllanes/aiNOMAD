import { WEIGHTS } from '../data/providers'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

const criteriaLabels = {
  reliability: 'Reliability',
  price: 'Price / kWh',
  capacity: 'Capacity',
  outage: 'Outage Frequency',
  peakLoad: 'Peak Load Handling',
  flexibility: 'Contract Flexibility',
}

export function WeightsLegend() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-white/80 text-sm uppercase tracking-widest">
          Scoring Weights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {Object.entries(WEIGHTS).map(([key, weight]) => (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="text-white/70">{criteriaLabels[key]}</span>
              <span className="font-semibold text-white">{(weight * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-white/50 leading-relaxed">
          Region: Cagayan de Oro<br />
          Demand: 120 MW<br />
          Strategy: Reliability-First
        </div>
      </CardContent>
    </Card>
  )
}
