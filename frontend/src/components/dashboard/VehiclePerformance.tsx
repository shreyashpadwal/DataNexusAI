/**
 * VehiclePerformance — compact table of top vehicles by revenue.
 * Data comes from GET /api/dashboard/stats → top_vehicles.
 */
import { Car } from 'lucide-react'
import type { TopVehicleItem } from '../../api/api'

interface Props {
  data: TopVehicleItem[]
  loading: boolean
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="shimmer h-4 w-4 rounded" />
      <div className="shimmer h-4 flex-1 rounded" />
      <div className="shimmer h-4 w-20 rounded" />
      <div className="shimmer h-4 w-12 rounded" />
    </div>
  )
}

export default function VehiclePerformance({ data, loading }: Props) {
  return (
    <div className="card">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
          <Car className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Vehicle Performance</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Top vehicles by revenue from successful payments</p>
        </div>
      </div>

      {loading ? (
        <div className="divide-y divide-[var(--border)]">
          {[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--text-muted)]">
          No data available for the selected period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left pb-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider w-8">#</th>
                <th className="text-left pb-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Vehicle Model</th>
                <th className="text-right pb-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Revenue</th>
                <th className="text-right pb-2.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Rides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.map((v, idx) => (
                <tr key={v.model} className="group hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="py-3 pr-3 text-xs text-[var(--text-dim)] tabular-nums">{idx + 1}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <Car className="w-3 h-3 text-violet-400" />
                      </div>
                      <span className="font-medium text-[var(--text-primary)] truncate max-w-[180px]">{v.model}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right tabular-nums font-semibold text-emerald-400">
                    ₹{v.revenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[var(--text-secondary)]">
                    {v.rides.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
