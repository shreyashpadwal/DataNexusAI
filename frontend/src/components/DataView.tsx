/**
 * DataView — TABLE | CHART toggle for query results.
 * Improved table with hover, numeric formatting, sticky header.
 * Auto-detects if data is chart-worthy.
 */
import { useState } from 'react'
import { Table, BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts'

interface Props {
  data: Record<string, unknown>[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

function isNumeric(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v)
}

function fmtCell(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'number') {
    if (Math.abs(v) >= 1000) return v.toLocaleString('en-IN', { maximumFractionDigits: 2 })
    return v.toFixed(2).replace(/\.00$/, '')
  }
  return String(v)
}

function detectChart(data: Record<string, unknown>[]):
  { suitable: boolean; labelKey: string; valueKey: string; type: 'bar' | 'pie' } | null
{
  if (data.length < 2 || data.length > 20) return null
  const keys = Object.keys(data[0])
  const labelKey = keys.find(k => typeof data[0][k] === 'string') ?? ''
  const valueKey = keys.find(k => isNumeric(data[0][k])) ?? ''
  if (!labelKey || !valueKey) return null
  return { suitable: true, labelKey, valueKey, type: data.length <= 5 ? 'pie' : 'bar' }
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card-sm text-xs py-2 px-3">
      {label && <p className="text-[var(--text-muted)] mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: COLORS[i % COLORS.length] }} className="font-medium">
          {Number(p.value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  )
}

function ChartSection({ data }: { data: Record<string, unknown>[] }) {
  const chart = detectChart(data)
  if (!chart) return null

  const chartData = data.map(row => ({
    name:  String(row[chart.labelKey] ?? ''),
    value: Number(row[chart.valueKey] ?? 0),
  }))

  if (chart.type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%"
               outerRadius={90} innerRadius={50} paddingAngle={3}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={50}
               tickFormatter={v => Number(v).toLocaleString('en-IN')} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function DataView({ data }: Props) {
  const [view, setView] = useState<'table' | 'chart'>('table')
  const [page, setPage] = useState(1)
  const rowsPerPage = 10
  
  const chart = detectChart(data)
  const columns = Object.keys(data[0] ?? {})

  const totalPages = Math.ceil(data.length / rowsPerPage)
  const startIndex = (page - 1) * rowsPerPage
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage)

  return (
    <div className="card space-y-4 animate-fade-in overflow-hidden">
      {/* Toggle + count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <p className="text-xs text-[var(--text-muted)]">
            Showing {Math.min(startIndex + 1, data.length)}â€“{Math.min(startIndex + rowsPerPage, data.length)} of {data.length} row{data.length !== 1 ? 's' : ''}
          </p>
          {data.length === 50 && (
            <span className="badge badge-amber text-xs">Limit 50 reached</span>
          )}
        </div>
        {chart && (
          <div className="flex rounded-lg overflow-hidden border border-[var(--border)]">
            {(['table', 'chart'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === v
                    ? 'bg-indigo-600/20 text-indigo-300'
                    : 'text-[var(--text-dim)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {v === 'table' ? <Table className="w-3 h-3" /> : <BarChart2 className="w-3 h-3" />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart view */}
      {view === 'chart' && chart && (
        <div className="animate-fade-in">
          <ChartSection data={data} />
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="animate-fade-in flex flex-col">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm border-collapse relative">
              <thead className="sticky top-0 z-10">
                <tr>
                  {columns.map(col => (
                    <th key={col}
                        className="text-left text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider
                                   px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-card)] whitespace-nowrap">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, i) => (
                  <tr key={i}
                      className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors last:border-0">
                    {columns.map(col => (
                      <td key={col}
                          className={`px-4 py-2.5 text-[var(--text-secondary)] whitespace-nowrap ${
                            isNumeric(row[col]) ? 'text-right font-mono text-[var(--text-primary)]' : ''
                          }`}>
                        {fmtCell(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-md disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-md disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
