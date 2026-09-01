/**
 * RidesCityChart — vertical bar chart for number of rides per city.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { RidesByCityItem } from '../../api/api'
import { useTheme } from '../../contexts/ThemeContext'

interface Props {
  data: RidesByCityItem[]
  loading: boolean
}

function SkeletonChart() {
  return (
    <div className="card">
      <div className="shimmer h-5 w-32 rounded mb-1" />
      <div className="shimmer h-3 w-44 rounded mb-5" />
      <div className="shimmer h-52 w-full rounded-xl" />
    </div>
  )
}

const COLORS = ['#818cf8', '#6366f1', '#a5b4fc', '#4f46e5', '#c7d2fe', '#4338ca', '#e0e7ff', '#3730a3', '#312e81', '#1e1b4b']

export default function RidesCityChart({ data, loading }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (loading) return <SkeletonChart />

  const axisColor = isDark ? '#64748b' : '#94a3b8'
  const gridColor = isDark ? '#1e2130' : '#e2e8f0'

  return (
    <div className="card">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Rides by City</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Total ride count per customer city</p>
      </div>

      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No data available for the selected period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="city"
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              formatter={(v: unknown) => {
                const num = typeof v === 'number' ? v : 0
                return [num.toLocaleString(), 'Rides']
              }}
              contentStyle={{
                background: isDark ? '#16181f' : '#ffffff',
                border: `1px solid ${isDark ? '#1e2130' : '#cbd5e1'}`,
                borderRadius: 10,
                fontSize: 12,
                color: isDark ? '#cbd5e1' : '#334155',
              }}
              cursor={{ fill: isDark ? 'rgba(129,140,248,0.07)' : 'rgba(129,140,248,0.05)' }}
            />
            <Bar dataKey="rides" radius={[6, 6, 0, 0]} maxBarSize={36}>
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
