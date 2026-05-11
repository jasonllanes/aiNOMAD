import {
  providers,
  DEFAULT_WEIGHTS,
  DEMAND_MW,
  PEAK_LOAD_MAP,
  FLEXIBILITY_MAP,
} from '../data/providers'

// ─── Normalization helpers ──────────────────────────────────────────────────

const allPrices = providers.map((p) => p.pricePerKwh)
const minPrice = Math.min(...allPrices)
const maxPrice = Math.max(...allPrices)

const allCapacities = providers.map((p) => p.capacityMW)
const minCap = Math.min(...allCapacities)
const maxCap = Math.max(...allCapacities)

const allOutages = providers.map((p) => p.outageFrequency)
const maxOutage = Math.max(...allOutages)

const allReliability = providers.map((p) => p.reliabilityScore)
const minRel = Math.min(...allReliability)
const maxRel = Math.max(...allReliability)

function normalizeReliability(score) {
  return ((score - minRel) / (maxRel - minRel)) * 100
}

// Lower price → higher score
function normalizePrice(price) {
  return ((maxPrice - price) / (maxPrice - minPrice)) * 100
}

// Higher capacity → higher score; if below demand threshold → 0 (HIGH RISK)
function normalizeCapacity(capacityMW) {
  if (capacityMW < DEMAND_MW) return 0
  return ((capacityMW - minCap) / (maxCap - minCap)) * 100
}

// Lower outage → higher score
function normalizeOutage(freq) {
  if (maxOutage === 0) return 100
  return ((maxOutage - freq) / maxOutage) * 100
}

// ─── Main scoring function ───────────────────────────────────────────────────

export function scoreProviders(weights = DEFAULT_WEIGHTS) {
  return providers
    .map((p) => {
      const isHighRisk = p.capacityMW < DEMAND_MW

      const normReliability = normalizeReliability(p.reliabilityScore)
      const normPrice = normalizePrice(p.pricePerKwh)
      const normCapacity = normalizeCapacity(p.capacityMW)
      const normOutage = normalizeOutage(p.outageFrequency)
      const normPeak = PEAK_LOAD_MAP[p.peakLoadHandling] ?? 0
      const normFlex = FLEXIBILITY_MAP[p.contractFlexibility] ?? 0

      const breakdown = {
        reliability: +(normReliability * weights.reliability).toFixed(2),
        price: +(normPrice * weights.price).toFixed(2),
        capacity: +(normCapacity * weights.capacity).toFixed(2),
        outage: +(normOutage * weights.outage).toFixed(2),
        peakLoad: +(normPeak * weights.peakLoad).toFixed(2),
        flexibility: +(normFlex * weights.flexibility).toFixed(2),
      }

      const totalScore = +Object.values(breakdown)
        .reduce((a, b) => a + b, 0)
        .toFixed(2)

      const normalizedScores = {
        reliability: +normReliability.toFixed(1),
        price: +normPrice.toFixed(1),
        capacity: +normCapacity.toFixed(1),
        outage: +normOutage.toFixed(1),
        peakLoad: normPeak,
        flexibility: normFlex,
      }

      return {
        ...p,
        isHighRisk,
        normalizedScores,
        breakdown,
        totalScore,
      }
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((p, idx) => ({ ...p, rank: idx + 1 }))
}

export function getRecommended(scored) {
  // Best score that is NOT high risk; fallback to overall best
  return scored.find((p) => !p.isHighRisk) ?? scored[0]
}
