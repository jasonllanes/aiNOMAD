import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Sparkles, Loader2 } from 'lucide-react'

export function AIReasoningCard({ reasoning, loading, error, onGenerate, hasApiKey }) {
  return (
    <Card className="border-purple-500/20 bg-purple-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-300 text-sm uppercase tracking-widest">
            <Sparkles size={16} />
            AI Procurement Reasoning
          </CardTitle>
          {hasApiKey && !loading && (
            <button
              onClick={onGenerate}
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
            >
              {reasoning ? 'Regenerate' : 'Generate'}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasApiKey && (
          <p className="text-sm text-white/40 leading-relaxed">
            AI reasoning is not configured on this deployment.
          </p>
        )}

        {hasApiKey && loading && (
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Loader2 size={14} className="animate-spin" />
            Generating AI analysis…
          </div>
        )}

        {hasApiKey && error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {reasoning && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            {reasoning.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm text-white/75 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        )}

        {hasApiKey && !loading && !reasoning && !error && (
          <p className="text-sm text-white/40">Click "Generate" to get LLaMA 3.3 70B powered analysis.</p>
        )}
      </CardContent>
    </Card>
  )
}
