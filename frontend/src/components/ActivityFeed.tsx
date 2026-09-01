import { Activity, Database, Cog, Clock } from 'lucide-react'

export interface ActivityItem {
  agent: 'sql' | 'etl' | 'error'
  question: string
  success: boolean
  timestamp: Date
  duration_ms?: number | null
}

interface Props { items: ActivityItem[] }

function fmtMs(ms?: number | null) {
  if (ms == null) return null
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
}

export default function ActivityFeed({ items }: Props) {
  if (items.length === 0) return null

  return (
    <div className="card-sm space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <p className="section-label">Agent Activity</p>
      </div>

      <ul className="space-y-1">
        {[...items].reverse().slice(0, 8).map((item, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
            {/* Icon */}
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${item.agent === 'sql'  ? 'bg-indigo-500/10' :
                item.agent === 'etl'  ? 'bg-violet-500/10' :
                                        'bg-red-500/10'}`}>
              {item.agent === 'etl'
                ? <Cog className="w-3 h-3 text-violet-400" />
                : <Database className="w-3 h-3 text-indigo-400" />
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[var(--text-dim)]">
                  {item.agent === 'sql' ? 'SQL Analyst' : item.agent === 'etl' ? 'ETL Agent' : 'System'}
                </span>
                <span className={`text-xs ${item.success ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.success ? '✓' : '✗'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-dim)] truncate mt-0.5">{item.question}</p>
            </div>

            {/* Duration */}
            {fmtMs(item.duration_ms) && (
              <span className="text-xs text-[var(--text-dim)] flex items-center gap-0.5 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {fmtMs(item.duration_ms)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
