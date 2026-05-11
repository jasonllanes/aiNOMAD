import Groq from 'groq-sdk'

/**
 * Sends scored provider data to Groq (LLaMA 3.3 70B) and returns a dashboard-friendly
 * procurement recommendation narrative.
 *
 * @param {Array} scoredProviders  - output of scoreProviders()
 * @param {Object} recommended     - the top-ranked non-risk provider
 * @returns {Promise<string>}      - plain text explanation
 */
export async function fetchAIReasoning(scoredProviders, recommended) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) {
    throw new Error('VITE_GROQ_API_KEY is not set in your .env file.')
  }

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true })

  const providerSummary = scoredProviders
    .map(
      (p) =>
        `Provider ${p.id} | Rank #${p.rank} | Score: ${p.totalScore} | ` +
        `Reliability: ${p.reliabilityScore} | Price: ₱${p.pricePerKwh}/kWh | ` +
        `Capacity: ${p.capacityMW} MW | Outages: ${p.outageFrequency}/month | ` +
        `Peak: ${p.peakLoadHandling} | Flexibility: ${p.contractFlexibility} | ` +
        `${p.isHighRisk ? '⚠️ HIGH RISK (capacity deficit)' : 'Eligible'}`
    )
    .join('\n')

  const systemPrompt = `You are an electricity procurement decision support AI for utility companies.
You analyze provider data using a weighted scoring model and provide clear, concise, business-friendly explanations.
Your output will be displayed inside a React dashboard card — keep it professional, direct, and free of technical jargon.
Use plain text. No markdown headers. No bullet symbols. Just clean paragraphs. Maximum 4 short paragraphs.`

  const userPrompt = `Region: Cagayan de Oro | Demand: 120 MW | Strategy: Reliability-First

Scored Providers (sorted best to worst):
${providerSummary}

Recommended Provider: ${recommended.name} (Score: ${recommended.totalScore})

Write a business-friendly procurement recommendation explaining:
1. Why ${recommended.name} is the best choice
2. The main trade-off to be aware of
3. Which provider is the best fallback and why
4. Any provider that should be avoided and the reason

Keep each paragraph to 2-3 sentences.`

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 500,
  })

  return response.choices[0]?.message?.content ?? 'No reasoning available.'
}
