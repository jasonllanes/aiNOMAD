import { useState, useMemo } from 'react'
import { scoreProviders, getRecommended } from './lib/scoring'
import { fetchAIReasoning } from './lib/openai'
import { ProviderCard } from './components/ProviderCard'
import { Charts } from './components/Charts'
import { WeightsTweaker, DEFAULT_RAW_WEIGHTS } from './components/WeightsTweaker'
import { AIReasoningCard } from './components/AIReasoningCard'
import { Zap } from 'lucide-react'

const hasApiKey = Boolean(import.meta.env.VITE_GROQ_API_KEY)

function App() {
  const [rawWeights, setRawWeights] = useState(DEFAULT_RAW_WEIGHTS)
  const [reasoning, setReasoning] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState('')

  // Normalize raw slider values → proportions for scoring
  const weights = useMemo(() => {
    const total = Object.values(rawWeights).reduce((a, b) => a + b, 0)
    if (total === 0) return rawWeights
    return Object.fromEntries(
      Object.entries(rawWeights).map(([k, v]) => [k, v / total])
    )
  }, [rawWeights])

  const scoredProviders = useMemo(() => scoreProviders(weights), [weights])
  const recommended = useMemo(() => getRecommended(scoredProviders), [scoredProviders])

  function handleWeightsChange(newRaw) {
    setRawWeights(newRaw)
    setReasoning('')   // reset AI output when weights change
    setAiError('')
  }

  async function handleGenerateReasoning() {
    setLoadingAI(true)
    setAiError('')
    try {
      const result = await fetchAIReasoning(scoredProviders, recommended)
      setReasoning(result)
    } catch (err) {
      setAiError(`Failed to fetch AI reasoning: ${err.message}`)
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-screen-2xl px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">aiNOMAD</h1>
              <p className="text-sm text-white/40">Electricity Procurement Decision Engine</p>
            </div>
          </div>
          <div className="text-right text-sm text-white/50 space-y-0.5">
            <div className="font-medium">Region: Cagayan de Oro</div>
            <div className="text-white/30">Demand: 120 MW &nbsp;·&nbsp; 20 Providers</div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-screen-2xl px-8 py-10 space-y-10">

        {/* Recommendation Banner */}
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/25 px-8 py-6 flex items-center justify-between gap-6">
          <div>
            <p className="text-xs text-emerald-400/60 uppercase tracking-widest mb-2 font-semibold">
              Top Recommendation
            </p>
            <p className="text-3xl font-extrabold text-emerald-400 mb-1">{recommended.name}</p>
            {recommended.type && (
              <p className="text-xs uppercase tracking-widest text-white/30 mb-3">{recommended.type}</p>
            )}
            <div className="flex flex-wrap gap-6 text-sm text-white/50">
              <span>Score: <strong className="text-white text-base">{recommended.totalScore}</strong></span>
              <span>Reliability: <strong className="text-white text-base">{recommended.reliabilityScore}</strong></span>
              <span>Price: <strong className="text-white text-base">₱{recommended.pricePerKwh}/kWh</strong></span>
              <span>Capacity: <strong className="text-white text-base">{recommended.capacityMW} MW</strong></span>
              <span>Outages: <strong className="text-white text-base">{recommended.outageFrequency}/mo</strong></span>
            </div>
          </div>
          <div className="hidden sm:flex shrink-0 h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500/40 text-4xl font-black text-emerald-400">
            #{recommended.rank}
          </div>
        </div>

        {/* Charts + Weight Tweaker */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <Charts scoredProviders={scoredProviders} />
          <WeightsTweaker rawWeights={rawWeights} onChange={handleWeightsChange} />
        </div>

        {/* AI Reasoning */}
        <AIReasoningCard
          reasoning={reasoning}
          loading={loadingAI}
          error={aiError}
          onGenerate={handleGenerateReasoning}
          hasApiKey={hasApiKey}
        />

        {/* Provider Cards */}
        <div>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-white/40">
            All Providers — Ranked
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {scoredProviders.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                isRecommended={p.id === recommended.id}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 pt-8 pb-4 text-center text-xs text-white/20">
          aiNOMAD · Electricity Procurement Decision Engine · Powered by Groq LLaMA 3.3 70B &amp; Weighted Multi-Criteria Analysis
        </footer>
      </main>
    </div>
  )
}

export default App
