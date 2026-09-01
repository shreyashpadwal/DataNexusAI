import { TableIcon } from 'lucide-react'

interface Props {
  data: Record<string, unknown>[]
}

export default function ResultsTable({ data }: Props) {
  if (!data || data.length === 0) return null

  const columns = Object.keys(data[0])

  const fmt = (v: unknown): string => {
    if (v === null || v === undefined) return '—'
    if (typeof v === 'number') {
      return Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
    return String(v)
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <TableIcon className="w-4 h-4 text-[var(--text-dim)]" />
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Query Results
          <span className="ml-2 text-[var(--text-muted)] font-normal">({data.length} row{data.length !== 1 ? 's' : ''})</span>
        </h3>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {columns.map(col => (
                <th key={col} className="text-left px-3 py-2 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider whitespace-nowrap">
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-3 py-2.5 text-[var(--text-secondary)] whitespace-nowrap">
                    {fmt(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
