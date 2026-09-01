/**
 * CityRevenueChart — horizontal bar chart for revenue by city.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { RevenueByCityItem } from '../../api/api'
import { useTheme } from '../../contexts/ThemeContext'

interface Props {
  data: RevenueByCityItem[]
  loading: boolean
}

function SkeletonChart() {
  return (
    <div className="card">
      <div className="shimmer h-5 w-36 rounded mb-1" />
      <div className="shimmer h-3 w-48 rounded mb-5" />
      <div className="shimmer h-52 w-full rounded-xl" />
    </div>
  )
}

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b']

export default function CityRevenueChart({ data, loading }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (loading) return <SkeletonChart />

  const axisColor = isDark ? '#64748b' : '#94a3b8'
  const gridColor = isDark ? '#1e2130' : '#e2e8f0'

  return (
    <div className="card">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Revenue by City</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Total revenue aggregated by customer city</p>
      </div>

      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No data available for the selected period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="city"
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip
              formatter={(v: unknown) => {
                const num = typeof v === 'number' ? v : 0
                return [`₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, 'Revenue']
              }}
              contentStyle={{
                background: isDark ? '#16181f' : '#ffffff',
                border: `1px solid ${isDark ? '#1e2130' : '#cbd5e1'}`,
                borderRadius: 10,
                fontSize: 12,
                color: isDark ? '#cbd5e1' : '#334155',
              }}
              cursor={{ fill: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.05)' }}
            />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {data.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
