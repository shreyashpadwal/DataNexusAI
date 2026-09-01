/**
 * QueryHistory — recent queries panel with timestamp, agent, status.
 */
import { Clock, Database, Cog, RotateCcw } from 'lucide-react'
import type { ActivityItem } from './ActivityFeed'

interface HistoryEntry {
  question: string
  agent: ActivityItem['agent']
  success: boolean
  duration_ms?: number | null
  timestamp: Date
}

interface Props {
  history: HistoryEntry[]
  onSelect: (q: string) => void
  loading?: boolean
}

function relTime(d: Date): string {
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function fmtMs(ms?: number | null) {
  if (ms == null) return null
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
}

export default function QueryHistory({ history, onSelect, loading }: Props) {
  if (history.length === 0) return null

  const recent = [...history].reverse().slice(0, 8)

  return (
    <div className="card-sm space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <p className="section-label">Recent Queries</p>
      </div>

      <ul className="space-y-1">
        {recent.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => { if (!loading) onSelect(item.question) }}
              disabled={loading}
              className="w-full text-left group flex items-start gap-3 px-3 py-2.5 rounded-xl
                         hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
            >
              {/* Agent icon */}
              <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0
                ${item.agent === 'sql' ? 'bg-indigo-500/10' : 'bg-violet-500/10'}`}>
                {item.agent === 'etl'
                  ? <Cog className="w-3 h-3 text-violet-400" />
                  : <Database className="w-3 h-3 text-indigo-400" />
                }
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-secondary)] truncate leading-snug group-hover:text-[var(--text-primary)] transition-colors">
                  {item.question}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--text-dim)]">{relTime(item.timestamp)}</span>
                  {fmtMs(item.duration_ms) && (
                    <span className="text-xs text-[var(--text-dim)]">· {fmtMs(item.duration_ms)}</span>
                  )}
                  <span className={`text-xs ${item.success ? 'text-emerald-600' : 'text-red-600'}`}>
                    {item.success ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              {/* Re-run icon */}
              <RotateCcw className="w-3 h-3 text-[var(--text-dim)] group-hover:text-[var(--text-dim)] flex-shrink-0 mt-1 transition-colors" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
