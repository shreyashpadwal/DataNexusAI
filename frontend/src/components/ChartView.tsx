import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  type PieLabelRenderProps,
} from 'recharts'
import { BarChart2 } from 'lucide-react'

interface Props {
  data: Record<string, unknown>[]
}

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#3b82f6','#10b981']

/**
 * Heuristic: detect if data is suitable for charting.
 * Requires exactly 1 label column + ≥1 numeric column, and 2–20 rows.
 */
function detectChart(data: Record<string, unknown>[]) {
  if (!data || data.length < 2 || data.length > 20) return null
  const cols = Object.keys(data[0])
  const numericCols = cols.filter(c =>
    data.every(r => r[c] !== null && r[c] !== '' && !isNaN(Number(r[c])))
  )
  const labelCols = cols.filter(c => !numericCols.includes(c))
  if (numericCols.length >= 1 && labelCols.length >= 1) {
    return { labelKey: labelCols[0], valueKey: numericCols[0] }
  }
  return null
}

const TooltipFormatter = (v: unknown) => {
  const n = Number(v)
  return [n.toLocaleString(undefined, { maximumFractionDigits: 2 }), '']
}

export default function ChartView({ data }: Props) {
  const chart = detectChart(data)
  if (!chart) return null

  const { labelKey, valueKey } = chart
  const chartData = data.map(r => ({
    name:  String(r[labelKey]),
    value: Number(r[valueKey]),
  }))

  const usePie = chartData.length <= 5

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Visualization</h3>
        <span className="text-xs text-[var(--text-muted)] ml-1">({usePie ? 'Pie' : 'Bar'} chart)</span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {usePie ? (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(props: PieLabelRenderProps) => {
                const name = String(props.name ?? '')
                const pct  = typeof props.percent === 'number' ? (props.percent * 100).toFixed(0) : '0'
                return `${name} (${pct}%)`
              }}
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
              formatter={TooltipFormatter}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
          </PieChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
              formatter={TooltipFormatter}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
