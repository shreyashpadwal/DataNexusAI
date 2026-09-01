/**
 * QueryHistoryPage - full-page query history browser.
 * Reads entries saved to localStorage by Dashboard.tsx.
 */
import { useState, useEffect, useMemo } from 'react'
import {
  Clock, Database, Cog, CheckCircle2, XCircle,
  Search, Trash2, ChevronDown, ChevronRight, Code2, Sparkles, RotateCcw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HistoryEntry {
  question:    string
  agent:       'sql' | 'etl' | 'error' | 'unknown'
  success:     boolean
  duration_ms: number | null | undefined
  timestamp:   string
  sql?:        string | null
  insight?:    { summary: string; key_observations: string[] } | null
  data?:       Record<string, unknown>[] | null
  answer?:     string | null
}

type FilterTab = 'all' | 'sql' | 'etl' | 'failed'

function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString()
}

function fmtMs(ms?: number | null) {
  if (ms == null) return null
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
}

function AgentBadge({ agent }: { agent: HistoryEntry['agent'] }) {
  if (agent === 'sql')
    return <span className="badge badge-indigo"><Database className="w-3 h-3" />SQL Analyst</span>
  if (agent === 'etl')
    return <span className="badge badge-violet"><Cog className="w-3 h-3" />ETL Agent</span>
  return <span className="badge badge-slate">Unknown</span>
}

export default function QueryHistoryPage() {
  const navigate = useNavigate()
  const [entries,      setEntries]      = useState<HistoryEntry[]>([])
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState<FilterTab>('all')
  const [expandedIdx,  setExpanded]     = useState<number | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('datanexus_query_history')
      if (raw) setEntries(JSON.parse(raw))
    } catch { setEntries([]) }
  }, [])

  const filtered = useMemo(() => entries.filter(e => {
    if (search && !e.question.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'sql')    return e.agent === 'sql'
    if (filter === 'etl')    return e.agent === 'etl'
    if (filter === 'failed') return !e.success
    return true
  }), [entries, search, filter])

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); return }
    localStorage.removeItem('datanexus_query_history')
    setEntries([]); setConfirmClear(false); setExpanded(null)
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'sql', label: 'SQL' },
    { key: 'etl', label: 'ETL' }, { key: 'failed', label: 'Failed' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setExpanded(null) }}
            placeholder="Search queries..." className="input-field pl-9" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl flex-shrink-0"
             style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setFilter(t.key); setExpanded(null) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                filter === t.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}>{t.label}</button>
          ))}
        </div>
        {entries.length > 0 && (
          <button onClick={handleClear}
            className={`btn-secondary text-xs py-2 flex-shrink-0 ${confirmClear ? 'border-red-500/40 text-red-400' : ''}`}>
            <Trash2 className="w-3.5 h-3.5" />
            {confirmClear ? 'Confirm clear?' : 'Clear All'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="card text-center py-16 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border)] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 text-[var(--text-dim)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)] text-sm">No queries yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Ask DataNexus AI a question to see your history here.</p>
          </div>
          <button onClick={() => navigate('/analyst')} className="btn-primary mx-auto">
            <Sparkles className="w-4 h-4" />Go to AI Analyst
          </button>
        </div>
      )}

      {/* No results */}
      {entries.length > 0 && filtered.length === 0 && (
        <div className="card text-center py-10 space-y-2">
          <p className="text-sm text-[var(--text-muted)]">No queries match your search or filter.</p>
          <button onClick={() => { setSearch(''); setFilter('all') }} className="btn-secondary text-xs py-1.5">Clear filters</button>
        </div>
      )}

      {/* List */}
      {filtered.length > 0 && (
        <div className="card space-y-0 divide-y divide-[var(--border)]">
          <div className="flex items-center gap-2 pb-4">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Query History</h2>
            <span className="ml-auto badge badge-slate">{filtered.length} {filtered.length === 1 ? 'query' : 'queries'}</span>
          </div>

          {filtered.map((entry, idx) => {
            const isExpanded = expandedIdx === idx
            const dur = fmtMs(entry.duration_ms)
            return (
              <div key={idx}>
                <button onClick={() => setExpanded(isExpanded ? null : idx)}
                  className="w-full flex items-start gap-4 py-4 text-left group hover:bg-[var(--bg-hover)] transition-colors rounded-xl px-2 -mx-2">
                  <div className="mt-0.5 flex-shrink-0">
                    {entry.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] leading-snug">{entry.question}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <AgentBadge agent={entry.agent} />
                      <span className="text-xs text-[var(--text-dim)]">{relTime(entry.timestamp)}</span>
                      {dur && <span className="text-xs text-[var(--text-dim)]">· {dur}</span>}
                      {entry.sql && <span className="text-xs text-[var(--text-dim)] flex items-center gap-1"><Code2 className="w-3 h-3" />SQL</span>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--text-dim)] flex-shrink-0 mt-0.5" />
                              : <ChevronRight className="w-4 h-4 text-[var(--text-dim)] flex-shrink-0 mt-0.5" />}
                </button>

                {isExpanded && (
                  <div className="mb-4 ml-8 space-y-4 animate-fade-in">
                    <div className="card-sm space-y-1">
                      <p className="section-label">User Question</p>
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">"{entry.question}"</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Agent',  value: entry.agent === 'sql' ? 'SQL Analyst' : entry.agent === 'etl' ? 'ETL Agent' : 'Unknown' },
                        { label: 'Status', value: entry.success ? 'Completed' : 'Failed' },
                        { label: 'Time',   value: dur ?? 'n/a' },
                        { label: 'Date',   value: new Date(entry.timestamp).toLocaleDateString() },
                      ].map(({ label, value }) => (
                        <div key={label} className="card-sm text-center">
                          <p className="section-label mb-1">{label}</p>
                          <p className={`text-xs font-medium ${label === 'Status' ? (entry.success ? 'text-emerald-400' : 'text-red-400') : 'text-[var(--text-secondary)]'}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {entry.sql && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          <p className="section-label">Generated SQL</p>
                          <span className="ml-auto badge badge-green text-xs">Validated</span>
                        </div>
                        <pre className="code-block text-xs overflow-x-auto">{entry.sql}</pre>
                      </div>
                    )}
                    {entry.insight?.summary && (
                      <div className="card-sm space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <p className="section-label">AI Insight</p>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{entry.insight.summary}</p>
                        {entry.insight.key_observations?.length > 0 && (
                          <ul className="space-y-1 pt-1">
                            {entry.insight.key_observations.map((obs, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                                <span className="text-indigo-500 flex-shrink-0">•</span>{obs}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {entry.data && entry.data.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="section-label">Result Preview ({entry.data.length} row{entry.data.length !== 1 ? 's' : ''})</p>
                        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                          <table className="w-full text-xs">
                            <thead><tr style={{ background: 'var(--bg-hover)' }}>
                              {Object.keys(entry.data[0]).map(col => (
                                <th key={col} className="px-3 py-2 text-left text-[var(--text-muted)] font-medium whitespace-nowrap">{col}</th>
                              ))}
                            </tr></thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {entry.data.map((row, ri) => (
                                <tr key={ri} className="hover:bg-[var(--bg-hover)] transition-colors">
                                  {Object.values(row).map((val, ci) => (
                                    <td key={ci} className="px-3 py-2 text-[var(--text-secondary)] font-mono whitespace-nowrap">{String(val ?? '—')}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    <button onClick={() => navigate('/analyst', { state: { question: entry.question } })} className="btn-secondary text-xs py-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />Re-run this query
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}