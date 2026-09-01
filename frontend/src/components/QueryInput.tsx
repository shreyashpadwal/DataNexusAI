/**
 * QueryInput — premium AI assistant query interface.
 * Large, focused input with suggested query chips.
 */
import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { Send, Loader2, Sparkles, X } from 'lucide-react'

const SUGGESTED = [
  'What is the total revenue?',
  'Which vehicle type generated the highest revenue?',
  'Show rides grouped by city',
  'What is the average customer rating?',
  'Show the top 5 vehicles by revenue',
  'How many rides were completed this year?',
]

interface Props {
  onSubmit: (q: string) => void
  loading: boolean
}

export default function QueryInput({ onSubmit, loading }: Props) {
  const [value, setValue] = useState('')
  const ref   = useRef<HTMLTextAreaElement>(null)

  const submit = useCallback(() => {
    const q = value.trim()
    if (!q || loading) return
    onSubmit(q)
    setValue('')
    ref.current?.focus()
  }, [value, loading, onSubmit])

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div
        className="relative rounded-2xl transition-all duration-200"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-mid)',
          boxShadow: value ? '0 0 0 2px rgba(99,102,241,0.18)' : 'none',
        }}
      >
        {/* Sparkle icon */}
        <div className="absolute left-4 top-4 pointer-events-none">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>

        <textarea
          ref={ref}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question about your data…"
          rows={2}
          disabled={loading}
          className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-dim)] text-sm leading-relaxed
                     pl-11 pr-24 py-4 resize-none focus:outline-none disabled:opacity-50"
          aria-label="Data query input"
        />

        {/* Actions row */}
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-xs text-[var(--text-dim)]">Press ⏎ to send · Shift+⏎ for newline</span>
          <div className="flex items-center gap-2">
            {value && !loading && (
              <button onClick={() => setValue('')} className="btn-ghost p-1.5" aria-label="Clear input">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={submit}
              disabled={!value.trim() || loading}
              className="btn-primary py-2 px-3 text-xs"
              aria-label="Submit query"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
              <span>{loading ? 'Analyzing…' : 'Analyze'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggested queries */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map(q => (
          <button
            key={q}
            onClick={() => { if (!loading) { setValue(q); ref.current?.focus() } }}
            disabled={loading}
            className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-full
                       border border-[var(--border)] hover:border-[var(--border-mid)] hover:bg-[var(--bg-hover)]
                       transition-all duration-150 disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
