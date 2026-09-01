/**
 * DataDashboard — visual analytics overview of the PostgreSQL dataset.
 *
 * Data flow:
 *   PostgreSQL → backend aggregation → /api/stats + /api/dashboard/stats
 *                → KPI cards + charts + vehicle table
 *
 * This is NOT the AI Analyst page. It's a separate metrics/visualization page.
 */
import { useState, useCallback, useEffect } from 'react'
import { RefreshCw, Database, AlertCircle } from 'lucide-react'
import { getStats, getDashboardStats, type StatsResponse, type DashboardStats, type DashboardPeriod } from '../api/api'
import KpiCards from '../components/dashboard/KpiCards'
import RevenueChart from '../components/dashboard/RevenueChart'
import CityRevenueChart from '../components/dashboard/CityRevenueChart'
import RidesCityChart from '../components/dashboard/RidesCityChart'
import VehiclePerformance from '../components/dashboard/VehiclePerformance'

const PERIOD_LABELS: { value: DashboardPeriod; label: string }[] = [
  { value: 'all',  label: 'All Time' },
  { value: '2024', label: '2024' },
  { value: '30d',  label: 'Last 30 Days' },
  { value: '7d',   label: 'Last 7 Days' },
]

function fmtLastUpdated(d: Date | null): string {
  if (!d) return '—'
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 5)  return 'Just now'
  if (diff < 60) return `${diff}s ago`
  return d.toLocaleTimeString()
}

export default function DataDashboard() {
  const [stats,     setStats]     = useState<StatsResponse | null>(null)
  const [chartData, setChartData] = useState<DashboardStats | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [period,    setPeriod]    = useState<DashboardPeriod>('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = useCallback(async (p: DashboardPeriod, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else           setLoading(true)
    setError(null)

    try {
      // Fetch both in parallel — stats for KPIs, chart data for visuals
      const [s, c] = await Promise.all([getStats(), getDashboardStats(p)])
      setStats(s)
      setChartData(c)
      setLastUpdated(new Date())
    } catch {
      setError(
        'Unable to load dashboard data. Please check that the DataNexus AI backend and PostgreSQL database are running.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchAll(period) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when period changes (after initial load)
  const handlePeriodChange = (p: DashboardPeriod) => {
    setPeriod(p)
    fetchAll(p)
  }

  const handleRefresh = () => {
    if (refreshing || loading) return
    fetchAll(period, true)
  }

  const chartLoading = loading

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Analytics Dashboard</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Explore your data through interactive analytics and real-time metrics.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
              <Database className="w-3 h-3" />
              <span>Data source: PostgreSQL</span>
            </div>
            <span className="text-[var(--border-mid)]">·</span>
            <span className="text-xs text-[var(--text-dim)]">
              Last updated: {fmtLastUpdated(lastUpdated)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Date filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)]"
               style={{ background: 'var(--bg-surface)' }}>
            {PERIOD_LABELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handlePeriodChange(value)}
                disabled={loading || refreshing}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 disabled:opacity-50
                  ${period === value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="btn-secondary px-3 py-2 gap-1.5 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Error state ──────────────────────────────────────────── */}
      {error && !loading && (
        <div className="card border-red-900/30 bg-red-950/10">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4.5 h-4.5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-300">Unable to load dashboard data.</p>
              <p className="text-xs text-red-400/80 mt-1">
                Please check that the DataNexus AI backend and PostgreSQL database are running.
              </p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────────── */}
      {!error && (
        <KpiCards stats={stats} loading={loading} />
      )}

      {/* ── Revenue Over Time ─────────────────────────────────────── */}
      {!error && (
        <RevenueChart
          data={chartData?.revenue_over_time ?? []}
          loading={chartLoading}
        />
      )}

      {/* ── City charts side by side ──────────────────────────────── */}
      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CityRevenueChart
            data={chartData?.revenue_by_city ?? []}
            loading={chartLoading}
          />
          <RidesCityChart
            data={chartData?.rides_by_city ?? []}
            loading={chartLoading}
          />
        </div>
      )}

      {/* ── Vehicle Performance ───────────────────────────────────── */}
      {!error && (
        <VehiclePerformance
          data={chartData?.top_vehicles ?? []}
          loading={chartLoading}
        />
      )}
    </div>
  )
}
