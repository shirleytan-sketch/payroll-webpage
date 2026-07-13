import { useMemo } from 'react'
import StatTile from '../components/StatTile.jsx'
import DepartmentChart from '../components/DepartmentChart.jsx'
import { IconTrend, IconWorkers } from '../components/icons.jsx'
import { mockDepartments, mockPeriod, getDashboardSummary, getRankedDepartments } from '../data/mockDashboard.js'
import { formatRM, formatNumber } from '../lib/format.js'

// TODO: once the Supabase schema for workers / piece_rate_entries / penalties /
// incentives is ready, replace mockDepartments with a live query (see src/lib/supabaseClient.js)
// and this page keeps working unchanged — the child components only care about
// the { name, workers, pieceRate, basicTopUp, penalty, incentive, total } shape.

export default function Dashboard() {
  const summary = useMemo(() => getDashboardSummary(mockDepartments), [])
  const ranked = useMemo(() => getRankedDepartments(mockDepartments), [])

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>
            Piece rate payout summary for <b>{mockPeriod}</b> &middot; all stations, workers with recorded
            output only
          </p>
        </div>
      </div>

      <div className="tiles">
        <StatTile
          icon={IconTrend}
          label="Total Payout"
          value={formatRM(summary.totalPayout)}
          sub={`${formatNumber(summary.totalWorkers)} workers · ${summary.stationCount} stations`}
        />
        <StatTile
          icon={IconWorkers}
          label="Avg Payout / Worker"
          value={formatRM(summary.avgPerWorker)}
          sub={`across ${formatNumber(summary.totalWorkers)} paid workers`}
        />
      </div>

      <DepartmentChart departments={ranked} />
    </div>
  )
}
