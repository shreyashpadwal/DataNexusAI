/**
 * SqlPanel — collapsible SQL display with copy button.
 * Secondary to the insight — available but not dominant.
 */
import { useState } from 'react'
import { Code2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

interface Props { sql: string }

export default function SqlPanel({ sql }: Props) {
  const [open,   setOpen]   = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200"
         style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
          <Code2 className="w-4 h-4 text-[var(--text-dim)]" />
          <span className="font-medium">Generated SQL</span>
          <span className="badge badge-indigo text-xs">SELECT</span>
        </div>
        <div className="flex items-center gap-2">
          {open && (
            <button
              onClick={e => { e.stopPropagation(); copy() }}
              className="btn-ghost py-1 px-2 text-xs"
              aria-label="Copy SQL"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span className="hidden sm:block">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
        </div>
      </button>

      {/* SQL body */}
      {open && (
        <div className="border-t border-[var(--border)] animate-fade-in">
          <pre className="code-block rounded-none rounded-b-2xl text-sm leading-relaxed m-0 border-0">
            {sql}
          </pre>
        </div>
      )}
    </div>
  )
}
