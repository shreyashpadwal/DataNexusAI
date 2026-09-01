/**
 * ProcessingTimeline — animated step-by-step AI processing indicator.
 * Uses actual steps from the API response when available.
 */
import { Check, Circle, Loader2 } from 'lucide-react'

const DEFAULT_STEPS = [
  'Understanding your question',
  'Classifying request type',
  'Generating SQL query',
  'Validating SQL',
  'Querying PostgreSQL',
  'Generating insight',
]

type StepState = 'done' | 'active' | 'pending'

interface Props {
  loading: boolean
  steps?: string[]
}

export default function ProcessingTimeline({ loading, steps }: Props) {
  if (!loading) return null

  const labels = (steps && steps.length > 0) ? steps : DEFAULT_STEPS

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        <span className="text-sm font-medium text-[var(--text-secondary)]">Analyzing your data…</span>
      </div>

      <div className="space-y-0">
        {DEFAULT_STEPS.map((step, i) => {
          // During loading, show first 2 as "done", 3rd as active, rest pending
          const state: StepState = i < 2 ? 'done' : i === 2 ? 'active' : 'pending'
          const isLast = i === DEFAULT_STEPS.length - 1

          return (
            <div key={step}>
              <div className="flex items-center gap-3 py-2">
                {/* Step icon */}
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {state === 'done' && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-indigo-400" />
                    </div>
                  )}
                  {state === 'active' && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-dot" />
                    </div>
                  )}
                  {state === 'pending' && (
                    <div className="w-5 h-5 rounded-full border border-[var(--border-mid)] flex items-center justify-center">
                      <Circle className="w-1.5 h-1.5 text-[var(--text-dim)]" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <span className={`text-sm ${
                  state === 'done'    ? 'text-[var(--text-muted)] line-through decoration-slate-700' :
                  state === 'active'  ? 'text-[var(--text-primary)] font-medium' :
                                        'text-[var(--text-dim)]'
                }`}>
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="ml-2.5 w-px h-3 bg-[var(--border)]" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
