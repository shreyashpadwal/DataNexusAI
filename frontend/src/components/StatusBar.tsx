/**
 * StatusBar — live backend + DB health indicator.
 * Polls /api/health every 15 seconds.
 */
import { useEffect, useState } from 'react'
import { Wifi, WifiOff, Database } from 'lucide-react'
import { checkHealth, type HealthResponse } from '../api/api'

type Status = 'online' | 'offline' | 'checking'

export default function StatusBar() {
  const [health,  setHealth]  = useState<HealthResponse | null>(null)
  const [status,  setStatus]  = useState<Status>('checking')

  const poll = () => {
    checkHealth()
      .then(h => { setHealth(h); setStatus('online') })
      .catch(() => { setStatus('offline') })
  }

  useEffect(() => {
    poll()
    const id = setInterval(poll, 15_000)
    return () => clearInterval(id)
  }, [])

  const dot =
    status === 'checking' ? 'bg-amber-400 animate-pulse-dot' :
    status === 'online'   ? 'bg-emerald-400' :
                            'bg-red-400'

  return (
    <div className="flex items-center gap-3">
      {/* Backend status */}
      <div className="flex items-center gap-1.5 group relative">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <Wifi className={`w-3.5 h-3.5 ${status === 'online' ? 'text-[var(--text-muted)]' : 'text-red-400'}`} />
        <span className="hidden sm:block text-xs text-[var(--text-dim)]">
          {status === 'online' ? 'Online' : status === 'checking' ? '…' : 'Offline'}
        </span>
      </div>

      {/* DB status */}
      {health && (
        <div className="flex items-center gap-1.5">
          <Database className={`w-3.5 h-3.5 ${health.database === 'connected' ? 'text-[var(--text-dim)]' : 'text-red-400'}`} />
          <span className="hidden sm:block text-xs text-[var(--text-dim)]">
            {health.database === 'connected' ? 'PostgreSQL' : 'DB offline'}
          </span>
        </div>
      )}

      {/* Version chip */}
      {health?.version && (
        <span className="hidden md:block text-xs text-[var(--text-dim)] font-mono">
          v{health.version}
        </span>
      )}
    </div>
  )
}
