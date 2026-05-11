import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

const COLORS = ['#10b981', '#3b82f6', '#38bdf8', '#a855f7', '#eab308']
const ALL_COLORS = [
  '#10b981','#3b82f6','#38bdf8','#a855f7','#eab308',
  '#ec4899','#f97316','#14b8a6','#6366f1','#84cc16',
  '#ef4444','#06b6d4','#8b5cf6','#f59e0b','#22d3ee',
  '#d946ef','#10b981','#fb923c','#4ade80','#60a5fa',
]

// ── Bar chart: all 20 sorted by rank ─────────────────────────────────────────
function buildBarData(scoredProviders) {
  return [...scoredProviders]
    .sort((a, b) => a.rank - b.rank)
    .map((p) => ({ name: p.name.replace(/ /g, '\u00A0'), shortName: p.id, Score: p.totalScore, rank: p.rank }))
}

// ── Radar: top 5 only ─────────────────────────────────────────────────────────
function buildRadarData(scoredProviders) {
  const top5 = [...scoredProviders].sort((a, b) => a.rank - b.rank).slice(0, 5)
  const axes = [
    { key: 'reliability', label: 'Reliability' },
    { key: 'price', label: 'Price' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'outage', label: 'Outage' },
    { key: 'peakLoad', label: 'Peak Load' },
    { key: 'flexibility', label: 'Flexibility' },
  ]
  return { top5, radarData: axes.map(({ key, label }) => {
    const entry = { subject: label }
    top5.forEach((p) => { entry[p.name] = p.normalizedScores[key] })
    return entry
  })}
}

const CustomBarLabel = ({ x, y, width, value }) => (
  <text x={x + width / 2} y={y - 4} fill="rgba(255,255,255,0.5)" textAnchor="middle" fontSize={10}>
    {value}
  </text>
)

export function Charts({ scoredProviders }) {
  const barData = buildBarData(scoredProviders)
  const { top5, radarData } = buildRadarData(scoredProviders)

  return (
    <div className="flex flex-col gap-6">
      {/* Bar chart — all 20 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white/70 text-xs uppercase tracking-widest font-semibold">
            Overall Weighted Score — All 20 Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={barData}
              margin={{ top: 20, right: 16, left: -10, bottom: 80 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                domain={[0, 100]}
                width={36}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' }}
                labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: '#94a3b8' }}
                formatter={(v) => [`${v}`, 'Score']}
              />
              <Bar dataKey="Score" radius={[4, 4, 0, 0]} label={<CustomBarLabel />}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={ALL_COLORS[i % ALL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar chart — top 5 only */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white/70 text-xs uppercase tracking-widest font-semibold">
              Criteria Comparison — Top 5 Providers
            </CardTitle>
            <div className="flex gap-3">
              {top5.map((p, i) => (
                <span key={p.id} className="flex items-center gap-1 text-xs text-white/50">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                  {p.name.split(' ').slice(0, 2).join(' ')}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500 }}
              />
              {top5.map((p, i) => (
                <Radar
                  key={p.id}
                  name={p.name}
                  dataKey={p.name}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.10}
                  strokeWidth={2}
                />
              ))}
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                itemStyle={{ color: '#94a3b8' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
