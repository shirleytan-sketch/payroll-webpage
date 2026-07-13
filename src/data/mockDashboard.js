// Sample data shaped the way the real Supabase queries will return it,
// so swapping mock -> live data later doesn't change any component props.

export const mockPeriod = 'July 2026'
export const mockMill = 'MJM Palm Oil Mill Sdn Bhd'

export const mockDepartments = [
  { name: 'FFB Reception & Transfer', workers: 21, pieceRate: 34200.0, basicTopUp: 8400.0, penalty: -90.0, incentive: 0 },
  { name: 'Ramp (Helper & Grader)', workers: 18, pieceRate: 22650.0, basicTopUp: 6120.0, penalty: -120.0, incentive: 900.0 },
  { name: 'Powerhouse & Fireman', workers: 10, pieceRate: 24300.0, basicTopUp: 4250.0, penalty: -60.0, incentive: 0 },
  { name: 'Kernel Recovery', workers: 7, pieceRate: 22600.0, basicTopUp: 2975.0, penalty: 0, incentive: 0 },
  { name: 'Oil Recovery', workers: 7, pieceRate: 19900.0, basicTopUp: 2975.0, penalty: 0, incentive: 0 },
  { name: 'Press & Threshing', workers: 7, pieceRate: 16800.0, basicTopUp: 2975.0, penalty: 0, incentive: 0 },
  { name: 'Laboratory', workers: 12, pieceRate: 19800.0, basicTopUp: 0, penalty: -60.0, incentive: 0 },
  { name: 'EB Station', workers: 7, pieceRate: 15400.0, basicTopUp: 2975.0, penalty: -30.0, incentive: 0 },
  { name: 'Water Treatment Plant', workers: 2, pieceRate: 5400.0, basicTopUp: 850.0, penalty: 0, incentive: 0 },
]

function totalPayout(d) {
  return d.pieceRate + d.basicTopUp + d.penalty + d.incentive
}

export function getDashboardSummary(departments = mockDepartments) {
  const totalWorkers = departments.reduce((sum, d) => sum + d.workers, 0)
  const totalPieceRate = departments.reduce((sum, d) => sum + d.pieceRate, 0)
  const totalPenalty = departments.reduce((sum, d) => sum + d.penalty, 0)
  const totalIncentive = departments.reduce((sum, d) => sum + d.incentive, 0)
  const totalPayoutAll = departments.reduce((sum, d) => sum + totalPayout(d), 0)

  return {
    totalWorkers,
    totalPieceRate,
    totalPenalty,
    totalIncentive,
    totalPayout: totalPayoutAll,
    avgPerWorker: totalWorkers ? totalPayoutAll / totalWorkers : 0,
    stationCount: departments.length,
  }
}

export function getRankedDepartments(departments = mockDepartments) {
  return departments
    .map((d) => ({ ...d, total: totalPayout(d) }))
    .sort((a, b) => b.total - a.total)
}
