/**
 * StatsPanel — live metric cards from /api/stats.
 * All values come from the backend — nothing is hardcoded.
 */
import { useEffect, useState } from 'react'
import { Users, Car, Navigation2, TrendingUp, Star, Database } from 'lucide-react'
import { getStats, type StatsResponse } from '../api/api'

interface CardDef {
  key: keyof Pick<StatsResponse, 'total_users' | 'total_vehicles' | 'total_rides' | 'total_revenue' | 'average_rating' | 'etl_rows_loaded'>
  label: string
  Icon: React.ElementType
  color: string
  bg: string
  currency?: boolean
}

const CARDS: CardDef[] = [
  { key: 'total_users',     label: 'Total Users',    Icon: Users,        color: 'text-blue-400',    bg: 'bg-blue-500/8' },
  { key: 'total_vehicles',  label: 'Vehicles',       Icon: Car,          color: 'text-violet-400',  bg: 'bg-violet-500/8' },
  { key: 'total_rides',     label: 'Total Rides',    Icon: Navigation2,  color: 'text-indigo-400',  bg: 'bg-indigo-500/8' },
  { key: 'total_revenue',   label: 'Revenue',        Icon: TrendingUp,   color: 'text-emerald-400', bg: 'bg-emerald-500/8', currency: true },
  { key: 'average_rating',  label: 'Avg Rating',     Icon: Star,         color: 'text-amber-400',   bg: 'bg-amber-500/8' },
  { key: 'etl_rows_loaded', label: 'Rows Processed', Icon: Database,     color: 'text-pink-400',    bg: 'bg-pink-500/8' },
]

function fmt(key: CardDef['key'], v: number, currency?: boolean): string {
  if (currency) return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  if (key === 'average_rating') return v.toFixed(2)
  return v.toLocaleString()
}

function SkeletonCard() {
  return (
    <div className="card-sm space-y-3">
      <div className="shimmer h-8 w-8 rounded-lg" />
      <div className="shimmer h-6 w-16 rounded-md" />
      <div className="shimmer h-3 w-20 rounded" />
    </div>
  )
}

export default function StatsPanel() {
  const [stats,   setStats]   = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map(({ key, label, Icon, color, bg, currency }) => (
        <div key={key} className="card-sm group hover:border-[var(--border-mid)] transition-all duration-200 space-y-3">
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <div className="text-xl font-semibold text-[var(--text-primary)] tabular-nums leading-tight">
              {fmt(key, stats[key] as number, currency)}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
