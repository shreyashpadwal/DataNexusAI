/**
 * KpiCards — four main metric cards at the top of the dashboard.
 * Data comes from the existing GET /api/stats endpoint (reused, no duplication).
 */
import { DollarSign, Navigation2, Users, Star } from 'lucide-react'
import type { StatsResponse } from '../../api/api'

interface Props {
  stats: StatsResponse | null
  loading: boolean
}

function SkeletonCard() {
  return (
    <div className="card-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="shimmer h-10 w-10 rounded-xl" />
        <div className="shimmer h-4 w-16 rounded" />
      </div>
      <div className="space-y-1.5">
        <div className="shimmer h-8 w-24 rounded-md" />
        <div className="shimmer h-3 w-32 rounded" />
      </div>
    </div>
  )
}

interface KpiDef {
  label: string
  Icon: React.ElementType
  iconBg: string
  iconColor: string
  getValue: (s: StatsResponse) => string
  sub: string
}

const KPI_DEFS: KpiDef[] = [
  {
    label: 'Total Revenue',
    Icon: DollarSign,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    getValue: (s) =>
      `₹${s.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    sub: 'From successful payments',
  },
  {
    label: 'Total Rides',
    Icon: Navigation2,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    getValue: (s) => s.total_rides.toLocaleString(),
    sub: 'Completed / recorded rides',
  },
  {
    label: 'Total Users',
    Icon: Users,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    getValue: (s) => s.total_users.toLocaleString(),
    sub: 'Registered ride customers',
  },
  {
    label: 'Average Rating',
    Icon: Star,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    getValue: (s) => `${s.average_rating.toFixed(2)} / 5`,
    sub: 'Customer satisfaction score',
  },
]

export default function KpiCards({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_DEFS.map(({ label, Icon, iconBg, iconColor, getValue, sub }) => (
        <div key={label} className="card-sm group hover:border-[var(--border-mid)] transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums leading-tight">
              {getValue(stats)}
            </div>
            <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">{label}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
