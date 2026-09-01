/**
 * RevenueChart — area chart showing revenue over time (by month).
 * Uses Recharts AreaChart with existing theme colors.
 */
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { RevenueOverTimeItem } from '../../api/api'
import { useTheme } from '../../contexts/ThemeContext'

interface Props {
  data: RevenueOverTimeItem[]
  loading: boolean
}

function SkeletonChart() {
  return (
    <div className="card">
      <div className="shimmer h-5 w-40 rounded mb-1" />
      <div className="shimmer h-3 w-56 rounded mb-5" />
      <div className="shimmer h-52 w-full rounded-xl" />
    </div>
  )
}

// Format "YYYY-MM" → "Jan '24"
function fmtMonth(m: string): string {
  const [year, month] = m.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

function fmtRevenue(v: number): string {
  return `₹${(v / 1000).toFixed(1)}k`
}

export default function RevenueChart({ data, loading }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (loading) return <SkeletonChart />

  const axisColor = isDark ? '#64748b' : '#94a3b8'
  const gridColor = isDark ? '#1e2130' : '#e2e8f0'

  return (
    <div className="card">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Revenue Over Time</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Monthly revenue from successful payments</p>
      </div>

      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No data available for the selected period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={fmtMonth}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmtRevenue}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(v: unknown) => {
                const num = typeof v === 'number' ? v : 0
                return [`₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, 'Revenue']
              }}
              labelFormatter={(m: unknown) => fmtMonth(String(m ?? ''))}
              contentStyle={{
                background: isDark ? '#16181f' : '#ffffff',
                border: `1px solid ${isDark ? '#1e2130' : '#cbd5e1'}`,
                borderRadius: 10,
                fontSize: 12,
                color: isDark ? '#cbd5e1' : '#334155',
              }}
              cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1', stroke: isDark ? '#16181f' : '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
