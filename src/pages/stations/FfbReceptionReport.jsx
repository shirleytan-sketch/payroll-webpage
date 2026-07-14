import { useMemo } from 'react'
import { ffbReceptionMonth, getSummary, getStationHourlyLog } from '../../data/ffbReception.js'
import StatTile from '../../components/StatTile.jsx'
import { IconTruck, IconDownload } from '../../components/icons.jsx'
import { formatRM, formatNumber } from '../../lib/format.js'
import { exportTablesToPdf } from '../../lib/exportPdf.js'
import { exportTableToExcel } from '../../lib/exportExcel.js'

function dayLabel(iso) {
  return String(Number(iso.slice(-2)))
}

// Entau (Station Head) isn't tied to one team — pay is based on both
// shifts' cages per the piece rate rules — so label him "Both" rather than
// picking a shift arbitrarily.
function shiftLabel(worker) {
  if (worker.team === 'A') return 'Shift A'
  if (worker.team === 'B') return 'Shift B'
  return 'Both'
}

function hourLabel(hour) {
  const next = (hour + 1) % 24
  return `${String(hour).padStart(2, '0')}:00–${String(next).padStart(2, '0')}:00`
}

function HourlyLogTable({ log }) {
  return (
    <div className="table-scroll">
      <table className="dense-table">
        <thead>
          <tr>
            <th>Time</th>
            {log.dates.map((d) => (
              <th key={d}>{dayLabel(d)}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {log.hourSlots.map((hour) => (
            <tr key={hour}>
              <td className="dept-name">{hourLabel(hour)}</td>
              {log.dates.map((d) => {
                const cages = log.grid[hour][d]
                return (
                  <td key={d} className={log.qualified[hour][d] ? 'cell-qualified' : cages ? '' : 'zero'}>
                    {cages || '—'}
                  </td>
                )
              })}
              <td className="total">{log.rowTotals[hour]}</td>
            </tr>
          ))}
          <tr>
            <td className="total">Total</td>
            {log.dates.map((d) => (
              <td key={d} className="total">
                {log.colTotals[d] || '—'}
              </td>
            ))}
            <td className="total">{log.grandTotal}</td>
          </tr>
          <tr>
            <td className="dept-count">1–4 cages/hr</td>
            {log.dates.map((d) => (
              <td key={d}>{log.baseBucketByCol[d] || '—'}</td>
            ))}
            <td>{log.baseBucketTotal}</td>
          </tr>
          <tr>
            <td className="dept-count">&gt;5 cages/hr</td>
            {log.dates.map((d) => (
              <td key={d}>{log.bonusBucketByCol[d] || '—'}</td>
            ))}
            <td>{log.bonusBucketTotal}</td>
          </tr>
        </tbody>
      </table>
      <div className="legend">
        <span className="legend-swatch cell-qualified" />
        Previous hour hit 4+ cages — this hour qualifies for the bonus rate
      </div>
    </div>
  )
}

function hourlyLogToPdfTable(log, heading) {
  return {
    heading,
    columns: ['Time', ...log.dates.map(dayLabel), 'Total'],
    rows: [
      ...log.hourSlots.map((hour) => [
        hourLabel(hour),
        ...log.dates.map((d) => log.grid[hour][d] || 0),
        log.rowTotals[hour],
      ]),
      ['Total', ...log.dates.map((d) => log.colTotals[d] || 0), log.grandTotal],
      ['1-4 cages/hr', ...log.dates.map((d) => log.baseBucketByCol[d] || 0), log.baseBucketTotal],
      ['>5 cages/hr', ...log.dates.map((d) => log.bonusBucketByCol[d] || 0), log.bonusBucketTotal],
    ],
    // Highlight qualifying cells the same yellow as the on-screen table.
    highlight: (rowIndex, colIndex) => {
      if (rowIndex >= log.hourSlots.length || colIndex === 0 || colIndex > log.dates.length) return false
      const hour = log.hourSlots[rowIndex]
      const date = log.dates[colIndex - 1]
      return log.qualified[hour][date]
    },
  }
}

export default function FfbReceptionReport() {
  const summary = useMemo(() => getSummary(), [])
  const logA = useMemo(() => getStationHourlyLog('A'), [])
  const logB = useMemo(() => getStationHourlyLog('B'), [])

  const downloadHourlyLog = () => {
    exportTablesToPdf({
      filename: 'ffb-reception-hourly-cages-log.pdf',
      title: 'FFB Reception — Hourly Cages Log',
      subtitle: ffbReceptionMonth,
      tables: [hourlyLogToPdfTable(logA, 'Shift A'), hourlyLogToPdfTable(logB, 'Shift B')],
    })
  }

  const summaryColumns = [
    'Worker',
    'Role',
    'Shift',
    'Total Cages',
    '1-4 Cages',
    '>4 Cages',
    'Piece Pay (RM)',
    'Total Payout (RM)',
  ]

  const summaryRows = () =>
    summary.map((w) => [
      w.name,
      w.role,
      shiftLabel(w),
      w.totalCages,
      w.baseCages,
      w.bonusCages,
      w.piecePay.toFixed(2),
      w.totalPayout.toFixed(2),
    ])

  const grandTotalPayout = summary.reduce((sum, w) => sum + w.totalPayout, 0)

  const summaryRowsWithTotal = () => [
    ...summaryRows(),
    ['Grand Total', '', '', '', '', '', '', grandTotalPayout.toFixed(2)],
  ]

  const downloadSummaryPdf = () => {
    exportTablesToPdf({
      filename: 'ffb-reception-piece-rate-summary.pdf',
      title: 'FFB Reception — Piece Rate Summary',
      subtitle: ffbReceptionMonth,
      orientation: 'portrait',
      tables: [{ columns: summaryColumns, rows: summaryRowsWithTotal() }],
    })
  }

  const downloadSummaryExcel = () => {
    exportTableToExcel({
      filename: 'ffb-reception-piece-rate-summary.xlsx',
      sheetName: 'Piece Rate Summary',
      columns: summaryColumns,
      rows: summaryRowsWithTotal(),
    })
  }

  return (
    <>
      <div className="tiles">
        <StatTile
          icon={IconTruck}
          label="Shift A — Cages Tipped"
          value={formatNumber(logA.grandTotal)}
          sub="up to date"
        />
        <StatTile
          icon={IconTruck}
          label="Shift B — Cages Tipped"
          value={formatNumber(logB.grandTotal)}
          sub="up to date"
        />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Hourly Cages Log</h2>
          <div className="card-head-actions">
            <span className="card-note">{ffbReceptionMonth} · total cages tipped per hour</span>
            <button className="btn btn-sm" onClick={downloadHourlyLog}>
              <IconDownload size={13} />
              Download PDF
            </button>
          </div>
        </div>
        <h3 className="table-subhead">
          Shift A <span className="table-subhead-note">— rotates weekly: Day (0700–1700) / Night (1700–0700)</span>
        </h3>
        <HourlyLogTable log={logA} />
        <h3 className="table-subhead">
          Shift B <span className="table-subhead-note">— opposite of Shift A each week</span>
        </h3>
        <HourlyLogTable log={logB} />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Piece Rate Summary</h2>
          <div className="card-head-actions">
            <span className="card-note">{ffbReceptionMonth}</span>
            <button className="btn btn-sm" onClick={downloadSummaryExcel}>
              <IconDownload size={13} />
              Download Excel
            </button>
            <button className="btn btn-sm" onClick={downloadSummaryPdf}>
              <IconDownload size={13} />
              Download PDF
            </button>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Total Cages</th>
                <th>1-4 Cages</th>
                <th>&gt;4 Cages</th>
                <th>Piece Pay</th>
                <th>Total Payout</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((w) => (
                <tr key={w.id}>
                  <td className="dept-name">{w.name}</td>
                  <td className="dept-count">{w.role}</td>
                  <td className="dept-count">{shiftLabel(w)}</td>
                  <td>{formatNumber(w.totalCages)}</td>
                  <td>{formatNumber(w.baseCages)}</td>
                  <td>{formatNumber(w.bonusCages)}</td>
                  <td>{formatRM(w.piecePay)}</td>
                  <td className="total">{formatRM(w.totalPayout)}</td>
                </tr>
              ))}
              <tr>
                <td className="total" colSpan={7}>
                  Grand Total
                </td>
                <td className="total">{formatRM(grandTotalPayout)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="table-tip">
          Bonus cages only pay the bonus rate when the previous hour also hit 4+ cages — otherwise they still
          pay, just at the base rate.
        </p>
      </div>
    </>
  )
}
