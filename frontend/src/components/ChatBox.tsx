import { useState, type KeyboardEvent } from 'react'
import { Send, Sparkles } from 'lucide-react'

const SAMPLE_QUESTIONS = [
  'What is the total revenue?',
  'Which vehicle type generated the highest revenue?',
  'What is the average customer rating?',
  'Show the number of rides by city.',
  'Show the top 5 vehicles by revenue.',
]

interface Props {
  onSubmit: (question: string) => void
  loading: boolean
}

export default function ChatBox({ onSubmit, loading }: Props) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    const q = value.trim()
    if (!q || loading) return
    onSubmit(q)
    setValue('')
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Ask DataNexus AI</h2>
      </div>

      <div className="relative">
        <textarea
          rows={3}
          className="input-field resize-none pr-14"
          placeholder="Ask anything about your data... (Press Enter to submit)"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                     disabled:cursor-not-allowed rounded-lg transition-colors"
          title="Submit (Enter)"
        >
          <Send className="w-4 h-4 text-[var(--text-primary)]" />
        </button>
      </div>

      {/* Sample questions */}
      <div>
        <p className="text-xs text-[var(--text-dim)] mb-2">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => { setValue(q); setTimeout(handleSubmit, 50) }}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-indigo-900/50 hover:text-indigo-300
                         border border-slate-700 hover:border-indigo-700 text-[var(--text-muted)] rounded-full
                         transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
