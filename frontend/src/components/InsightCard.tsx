/**
 * InsightCard — primary AI answer display.
 * Handles: success | clarification | unsafe | cannot_generate | error
 */
import { useState } from 'react'
import { Sparkles, Cog, Copy, Check, ChevronDown, ChevronUp,
         Clock, Hash, ShieldOff, HelpCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import type { ChatResponse } from '../api/api'

interface Props {
  result: ChatResponse
  onFollowUp?: (q: string) => void
}

function fmtDuration(ms: number | null | undefined): string {
  if (ms == null) return ''
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
}

// ── Clarification card ──────────────────────────────────────────────────
function ClarificationCard({ answer, onFollowUp }: { answer: string; onFollowUp?: (q: string) => void }) {
  // Parse tables from the answer: "CLARIFICATION_NEEDED:users,rides,..."
  const raw    = answer.replace('CLARIFICATION_NEEDED:', '').trim()
  const tables = raw.split(',').map(t => t.trim()).filter(Boolean)

  const TABLE_LABELS: Record<string, string> = {
    users:       'Users',
    vehicles:    'Vehicles',
    rides:       'Rides',
    payments:    'Payments',
    ratings:     'Ratings',
    etl_staging: 'ETL Data',
  }
  const TABLE_QUERIES: Record<string, string> = {
    users:       'Show all users',
    vehicles:    'Show all vehicles',
    rides:       'Show all rides',
    payments:    'Show all payments',
    ratings:     'Show all ratings',
    etl_staging: 'Show ETL staging data',
  }

  return (
    <div className="card animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <HelpCircle className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold">Clarification needed</p>
        </div>
        <span className="ml-auto badge badge-amber text-xs">Ambiguous</span>
      </div>

      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
        Your request could refer to multiple datasets. Which data would you like to see?
      </p>

      {/* Table buttons */}
      <div className="flex flex-wrap gap-2">
        {tables.map(table => (
          <button
            key={table}
            onClick={() => onFollowUp?.(TABLE_QUERIES[table] ?? `Show all ${table}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                       text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-mid)]
                       hover:border-indigo-500/40 hover:bg-indigo-500/10
                       transition-all duration-150"
          >
            {TABLE_LABELS[table] ?? table}
          </button>
        ))}
      </div>

      <p className="text-xs text-[var(--text-dim)]">
        Click a dataset above to view its records — all queries are validated and read-only.
      </p>
    </div>
  )
}

// ── Unsafe card ─────────────────────────────────────────────────────────
function UnsafeCard({ question }: { question: string }) {
  return (
    <div className="card animate-fade-in space-y-3 border-red-900/30 bg-red-950/5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldOff className="w-4 h-4 text-red-400" />
        </div>
        <span className="badge badge-red text-xs">Blocked</span>
      </div>
      <p className="text-sm font-medium text-red-300">This operation isn't allowed.</p>
      <p className="text-sm text-[var(--text-dim)] leading-relaxed">
        DataNexus AI only permits safe, read-only analytics on the database.
        Destructive operations (DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE) are permanently blocked.
      </p>
      <div className="text-xs text-[var(--text-dim)] font-mono bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg px-3 py-2">
        Blocked: "{question}"
      </div>
    </div>
  )
}

// ── Cannot generate card ────────────────────────────────────────────────
function CannotGenerateCard({ onFollowUp }: { onFollowUp?: (q: string) => void }) {
  const suggestions = ['What is the total revenue?', 'Show all users', 'Show all rides', 'Average customer rating']
  return (
    <div className="card animate-fade-in space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-slate-700/50 border border-slate-700 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-[var(--text-muted)]" />
        </div>
        <span className="badge badge-slate text-xs">Needs clarification</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">I couldn't determine what data you're asking about. Try being more specific:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => (
          <button key={s} onClick={() => onFollowUp?.(s)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-full
                       border border-[var(--border)] hover:border-[var(--border-mid)] hover:bg-[var(--bg-hover)] transition-all duration-150">
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main InsightCard ────────────────────────────────────────────────────
export default function InsightCard({ result, onFollowUp }: Props) {
  const [copied,    setCopied]    = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  // Route to special cards based on agent type
  if (result.agent === 'clarification') {
    return <ClarificationCard answer={result.answer ?? ''} onFollowUp={onFollowUp} />
  }
  if (result.agent === 'unsafe') {
    return <UnsafeCard question={result.question} />
  }
  if (result.agent === 'cannot_generate' || result.agent === 'unknown') {
    return <CannotGenerateCard onFollowUp={onFollowUp} />
  }

  // Strip internal prefixes from displayed answer
  const displayAnswer = (result.answer ?? '')
    .replace(/^(INVALID:|DB_ERROR:|SYSTEM_ERROR:)\s*/i, '')

  const isETL    = result.agent === 'etl'
  const isError  = !result.success

  const copyAnswer = () => {
    if (displayAnswer) {
      navigator.clipboard.writeText(displayAnswer).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
    }
  }

  return (
    <div className="card animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            ${isETL ? 'bg-violet-500/10' : isError ? 'bg-red-500/10' : 'bg-indigo-500/10'}`}>
            {isETL
              ? <Cog className="w-4 h-4 text-violet-400" />
              : isError
                ? <AlertTriangle className="w-4 h-4 text-red-400" />
                : <Sparkles className="w-4 h-4 text-indigo-400" />}
          </div>
          <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold">
            {isETL ? 'ETL Agent' : isError ? 'Analysis failed' : 'AI Insight'}
          </p>
        </div>
        <span className={`badge text-xs flex-shrink-0 ${result.success ? 'badge-green' : 'badge-red'}`}>
          {result.success ? '✓ Completed' : '✗ Failed'}
        </span>
      </div>

      {/* Question echo */}
      <div className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-hover)] border border-[var(--border)] rounded-lg px-3 py-2">
        "{result.question}"
      </div>

      {/* Main answer */}
      {result.insight ? (
        <div className="space-y-4">
          <p className="text-[15px] leading-relaxed text-[var(--text-primary)] font-medium">
            {result.insight.summary}
          </p>
          {result.insight.key_observations && result.insight.key_observations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Key Observations</p>
              <ul className="space-y-1.5">
                {result.insight.key_observations.map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        displayAnswer && (
          <p className={`text-[15px] leading-relaxed ${isError ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
            {displayAnswer}
          </p>
        )
      )}

      {/* Metadata + actions */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-4">
        <span className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${
            isETL ? 'bg-violet-400' : isError ? 'bg-red-400' : 'bg-indigo-400'
          }`} />
          {isETL ? 'ETL Agent' : isError ? 'Error' : 'SQL Analyst'}
        </span>
        {result.duration_ms != null && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {fmtDuration(result.duration_ms)}
          </span>
        )}
        {result.request_id && (
          <span className="flex items-center gap-1 font-mono">
            <Hash className="w-3 h-3" />
            {result.request_id}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {result.steps && result.steps.length > 0 && (
            <button onClick={() => setShowSteps(s => !s)} className="btn-ghost text-xs py-1 px-2">
              Steps {showSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
          {(displayAnswer || result.insight) && result.success && (
            <button onClick={copyAnswer} className="btn-ghost text-xs py-1 px-2">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Steps trace */}
      {showSteps && result.steps && result.steps.length > 0 && (
        <div className="space-y-1.5 border-t border-[var(--border)] pt-4 animate-fade-in">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">Execution trace</p>
          {result.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
              <Check className="w-3 h-3 text-indigo-500 flex-shrink-0" />
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
