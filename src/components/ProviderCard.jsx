import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Card, CardContent } from './ui/card'
import { Trophy, AlertTriangle } from 'lucide-react'

const RANK_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-sky-400',
  'bg-violet-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-lime-500',
]

const criteriaKeys = [
  { key: 'reliability', label: 'Reliability' },
  { key: 'price', label: 'Price' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'outage', label: 'Outage' },
  { key: 'peakLoad', label: 'Peak Load' },
  { key: 'flexibility', label: 'Flexibility' },
]

export function ProviderCard({ provider, isRecommended }) {
  const barColor = isRecommended
    ? 'bg-emerald-500'
    : RANK_COLORS[(provider.rank - 1) % RANK_COLORS.length]

  return (
    <Card
      className={`relative flex flex-col transition-all duration-300 ${
        isRecommended
          ? 'ring-2 ring-emerald-500/60 bg-emerald-950/20'
          : provider.isHighRisk
          ? 'ring-1 ring-red-500/30 bg-red-950/10'
          : ''
      }`}
    >
      {/* Top strip */}
      <div className={`h-1 w-full rounded-t-xl ${barColor}`} />

      {/* Rank + status */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
        <span className="text-sm font-black text-white/25">#{provider.rank}</span>
        {isRecommended && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <Trophy size={11} /> Best
          </span>
        )}
        {provider.isHighRisk && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-red-400">
            <AlertTriangle size={11} /> Risk
          </span>
        )}
      </div>

      <CardContent className="pt-5 flex flex-col gap-4 flex-1">
        {/* Provider name + type */}
        <div>
          <h3 className="text-base font-bold text-white leading-snug pr-8">{provider.name}</h3>
          {provider.type && (
            <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wider">{provider.type}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">₱{provider.pricePerKwh}/kWh</Badge>
          <Badge variant={provider.capacityMW >= 120 ? 'success' : 'danger'}>
            {provider.capacityMW} MW
          </Badge>
          <Badge
            variant={
              provider.outageFrequency === 0
                ? 'success'
                : provider.outageFrequency >= 4
                ? 'danger'
                : 'warning'
            }
          >
            {provider.outageFrequency}/mo outages
          </Badge>
        </div>

        {/* Total score */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Weighted Score</span>
            <span className="text-3xl font-extrabold text-white tabular-nums">{provider.totalScore}</span>
          </div>
          <Progress value={provider.totalScore} barClassName={barColor} className="h-2.5" />
        </div>

        {/* Criteria breakdown */}
        <div className="space-y-2.5">
          {criteriaKeys.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2.5 text-xs">
              <span className="w-16 shrink-0 text-white/40">{label}</span>
              <Progress
                value={provider.normalizedScores[key]}
                className="h-1.5 flex-1"
                barClassName={barColor}
              />
              <span className="w-7 text-right text-white/50 tabular-nums">
                {provider.normalizedScores[key].toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        {/* Raw stats footer */}
        <div className="mt-auto pt-3 border-t border-white/5 grid grid-cols-3 gap-x-2 gap-y-1.5 text-[11px]">
          <div className="text-white/35">Reliability</div>
          <div className="text-white/35">Peak</div>
          <div className="text-white/35">Flex</div>
          <div className="font-semibold text-white/70">{provider.reliabilityScore}</div>
          <div className="font-semibold text-white/70">{provider.peakLoadHandling}</div>
          <div className="font-semibold text-white/70">{provider.contractFlexibility}</div>
        </div>
      </CardContent>
    </Card>
  )
}
