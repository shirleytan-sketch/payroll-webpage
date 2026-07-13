import { formatRM } from '../lib/format.js'

export default function DepartmentChart({ departments }) {
  const max = Math.max(...departments.map((d) => d.total), 1)
  const grandTotal = departments.reduce((sum, d) => sum + d.total, 0)

  return (
    <div className="card">
      <div className="card-head">
        <h2>Payout by Department</h2>
        <span className="card-note">Total payout, ranked highest to lowest</span>
      </div>
      <div className="chart-rows">
        {departments.map((d) => (
          <div className="chart-row" key={d.name}>
            <span className="row-label">{d.name}</span>
            <div className="track">
              <div className="fill" style={{ width: `${(d.total / max) * 100}%` }} />
            </div>
            <span className="row-value">{formatRM(d.total)}</span>
          </div>
        ))}
      </div>
      <div className="chart-foot">
        <span>{departments.length} stations</span>
        <span>Grand total {formatRM(grandTotal)}</span>
      </div>
    </div>
  )
}
