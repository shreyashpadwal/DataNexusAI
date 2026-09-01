/**
 * Dashboard — AI Analyst page (fully redesigned).
 * Preserves all existing API calls and state management.
 */
import { useState, useCallback } from 'react'
import { Sparkles }         from 'lucide-react'
import QueryInput           from '../components/QueryInput'
import ProcessingTimeline   from '../components/ProcessingTimeline'
import InsightCard          from '../components/InsightCard'
import SqlPanel             from '../components/SqlPanel'
import DataView             from '../components/DataView'
import QueryHistory         from '../components/QueryHistory'
import StatsPanel           from '../components/StatsPanel'
import ExploreFurther       from '../components/ExploreFurther'
import ActivityFeed, { type ActivityItem } from '../components/ActivityFeed'
import { sendChatMessage, type ChatResponse } from '../api/api'

interface HistoryEntry {
  question:    string
  agent:       ActivityItem['agent']
  success:     boolean
  duration_ms: number | null | undefined
  timestamp:   Date
}

export default function Dashboard() {
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<ChatResponse | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [history,  setHistory]  = useState<HistoryEntry[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])

  const handleQuery = useCallback(async (question: string) => {
    if (loading) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await sendChatMessage(question)
      setResult(res)
      const entry: HistoryEntry = {
        question,
        agent:       res.agent as ActivityItem['agent'],
        success:     res.success,
        duration_ms: res.duration_ms,
        timestamp:   new Date(),
      }
      setHistory(prev => [entry, ...prev.filter(h => h.question !== question)].slice(0, 10))
      setActivity(prev => [...prev, {
        agent:       res.agent as ActivityItem['agent'],
        question,
        success:     res.success,
        timestamp:   new Date(),
        duration_ms: res.duration_ms,
      }])

      // Persist rich history to localStorage for QueryHistoryPage
      try {
        const historyItem = {
          question,
          agent:       res.agent,
          success:     res.success,
          duration_ms: res.duration_ms,
          timestamp:   new Date().toISOString(),
          sql:         res.sql,
          insight:     res.insight,
          data:        res.data?.slice(0, 5) ?? null,
          answer:      res.answer,
        }
        const prevRaw = localStorage.getItem('datanexus_query_history')
        const prevArr = prevRaw ? JSON.parse(prevRaw) : []
        const filtered = prevArr.filter((h: { question: string }) => h.question !== question)
        localStorage.setItem('datanexus_query_history', JSON.stringify([historyItem, ...filtered].slice(0, 30)))
      } catch { /* localStorage may be unavailable — non-fatal */ }

    } catch (err: any) {
      const data = err?.response?.data
      const msg = data?.detail
      const debug = data?.debug
      
      console.error("Backend Error Details:", debug || err)
      
      setError(msg ?? 'Cannot reach the backend. Is the server running on port 8000?')
    } finally {
      setLoading(false)
    }
  }, [loading])


  return (
    <div className="space-y-6">

      {/* Stats row */}
      <StatsPanel />

      {/* Query interface */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Ask your data anything</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Powered by LangGraph · Groq · PostgreSQL</p>
          </div>
        </div>
        <QueryInput onSubmit={handleQuery} loading={loading} />
      </div>

      {/* Processing animation */}
      {loading && <ProcessingTimeline loading={loading} />}

      {/* Error */}
      {error && !loading && (
        <div className="card border-red-900/30 bg-red-950/10 animate-fade-in space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-red-400 text-sm">✗</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Analysis couldn't be completed.</p>
              <p className="text-xs text-red-400/80 mt-1">We couldn't process this request. Please try again.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pl-11">
            <button
              onClick={() => { setError(null); handleQuery(history[0]?.question || ''); }}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-500/20"
            >
              Try Again
            </button>
            <button
              onClick={() => alert(`Technical details:\n\n${error}`)}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors"
            >
              View Details
            </button>
            <button
              onClick={() => setError(null)}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors ml-auto"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Primary insight */}
          <InsightCard result={result} onFollowUp={handleQuery} />

          {/* SQL — secondary */}
          {result.sql && <SqlPanel sql={result.sql} />}

          {/* Data table + chart */}
          {result.data && result.data.length > 0 && (
            <DataView data={result.data} />
          )}

          {/* Explore Further */}
          {result.success && (
            <ExploreFurther question={result.question} onSelect={handleQuery} />
          )}
        </div>
      )}

      {/* History + Activity */}
      {(history.length > 0 || activity.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QueryHistory history={history} onSelect={handleQuery} loading={loading} />
          <ActivityFeed items={activity} />
        </div>
      )}
    </div>
  )
}
