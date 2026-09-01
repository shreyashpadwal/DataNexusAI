import { Clock } from 'lucide-react'

interface Props {
  history: string[]
  onSelect: (q: string) => void
}

export default function HistoryPanel({ history, onSelect }: Props) {
  if (history.length === 0) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-[var(--text-dim)]" />
        <h3 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider">Recent Queries</h3>
      </div>
      <ul className="space-y-1">
        {[...history].reverse().slice(0, 10).map((q, i) => (
          <li key={i}>
            <button
              onClick={() => onSelect(q)}
              className="w-full text-left text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]
                         px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors
                         truncate block"
              title={q}
            >
              <span className="text-[var(--text-muted)] mr-2">›</span>{q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
