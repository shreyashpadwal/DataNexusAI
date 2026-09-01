import { Bot, Database, Cog, AlertTriangle } from 'lucide-react'
import type { ChatResponse } from '../api/api'

const AGENT_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  sql:   { label: 'SQL Analyst',  color: 'bg-blue-900/50 text-blue-300 border-blue-700',    Icon: Database },
  etl:   { label: 'ETL Agent',    color: 'bg-violet-900/50 text-violet-300 border-violet-700', Icon: Cog },
  error: { label: 'System',       color: 'bg-red-900/50 text-red-300 border-red-700',       Icon: AlertTriangle },
}

interface Props {
  result: ChatResponse
}

export default function AnswerCard({ result }: Props) {
  const meta = AGENT_META[result.agent] ?? { label: result.agent, color: 'bg-slate-800 text-[var(--text-secondary)] border-slate-700', Icon: Bot }
  const { Icon } = meta

  return (
    <div className="card space-y-4">
      {/* Agent badge */}
      <div className="flex items-center justify-between">
        <div className={`badge border ${meta.color}`}>
          <Icon className="w-3 h-3" />
          {meta.label}
        </div>
        {result.steps.length > 0 && (
          <div className="text-xs text-[var(--text-dim)] hidden sm:flex gap-2">
            {result.steps.map((s, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-[var(--text-dim)]">›</span>}
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Answer */}
      {result.success ? (
        <div>
          <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider mb-2">AI Answer</p>
          <p className="text-[var(--text-primary)] text-base leading-relaxed">{result.answer}</p>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-sm">{result.answer || result.error || 'An error occurred.'}</p>
        </div>
      )}
    </div>
  )
}
