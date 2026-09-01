import { useState } from 'react'
import { ChevronDown, ChevronRight, Code } from 'lucide-react'

interface Props {
  sql: string
}

export default function SqlViewer({ sql }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <Code className="w-4 h-4 text-[var(--text-dim)]" />
        <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors font-medium">
          Generated SQL
        </span>
        {open
          ? <ChevronDown className="w-4 h-4 text-[var(--text-dim)] ml-auto" />
          : <ChevronRight className="w-4 h-4 text-[var(--text-dim)] ml-auto" />
        }
      </button>

      {open && (
        <div className="mt-4">
          <pre className="code-block">{sql}</pre>
        </div>
      )}
    </div>
  )
}
