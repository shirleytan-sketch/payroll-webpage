import {
  computeShiftBuckets,
  computePay,
  bucketHourlyTotal,
  computeHighlightedHours,
  MIN_WAGE_DAILY,
} from '../lib/pieceRate.js'

export const ffbReceptionMonth = 'July 2026'

// role rate cards — each worker can carry their own personal rate
// ("their piece rate depends on their previous salary level or any salary
// increment they received before"). `team` is a fixed crew identity — the
// actual hours that team works rotate weekly, see getWorkingHours below.
export const workers = [
  { id: 'ahmad', name: 'Ahmad', role: 'Operator', team: 'A', rate: { base: 3.2, bonus: 5.0 } },
  { id: 'fatimah', name: 'Fatimah', role: 'Operator', team: 'A', rate: { base: 3.2, bonus: 5.0 } },
  { id: 'kumar', name: 'Kumar', role: 'Assistant Station Head', team: 'A', rate: { base: 4.2, bonus: 6.0 } },
  { id: 'muthu', name: 'Muthu', role: 'Operator', team: 'B', rate: { base: 3.2, bonus: 5.0 } },
  { id: 'wong', name: 'Wong', role: 'Assistant Station Head', team: 'B', rate: { base: 4.0, bonus: 5.8 } },
  { id: 'entau', name: 'Entau', role: 'Station Head', team: null, rate: { base: 3.5, bonus: 5.0 } },
]

// Hour slots in the order the source sheet lists them: 0700 -> 0600 next day.
export const HOUR_SLOTS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6]

// Day window is 10 hours (0700-1700); night window is the other 14 (1700-0700).
// Teams rotate between them week to week — this is NOT a fixed per-team window.
const DAY_WINDOW = HOUR_SLOTS.slice(0, 10)
const NIGHT_WINDOW = HOUR_SLOTS.slice(10)

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function generateMonthDates(year, month) {
  const count = daysInMonth(year, month)
  return Array.from({ length: count }, (_, i) => {
    const d = String(i + 1).padStart(2, '0')
    const m = String(month).padStart(2, '0')
    return `${year}-${m}-${d}`
  })
}

export const sampleDates = generateMonthDates(2026, 7)

// Rotation: Week 1 (Jul 1-7) Team A = day, Week 2 (Jul 8-14) Team A = night,
// Week 3 = day, Week 4 = night, Week 5 (Jul 29-31) continues the pattern.
// Team B always takes whichever window Team A isn't working that week.
function weekIndex(dateIso) {
  const dayOfMonth = Number(dateIso.slice(-2))
  return Math.floor((dayOfMonth - 1) / 7)
}

function isTeamADayWeek(dateIso) {
  return weekIndex(dateIso) % 2 === 0
}

// The window (10hr day / 14hr night) a given team actually works on a date.
export function getWorkingHours(team, dateIso) {
  const teamADay = isTeamADayWeek(dateIso)
  const teamIsDay = team === 'A' ? teamADay : !teamADay
  return teamIsDay ? DAY_WINDOW : NIGHT_WINDOW
}

// Deterministic pseudo-random so the demo is stable across renders/builds.
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFor(key, date) {
  let h = 0
  const s = key + date
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

// Special cases called out from the PDF, so the mock demonstrates both leave rules:
const LEAVE_EVENTS = {
  [`fatimah|${sampleDates[4]}`]: { type: 'annual' }, // Operator paid leave -> min-wage day, no cages
  [`entau|${sampleDates[8]}`]: { type: 'unpaid' }, // Station Head unpaid leave -> cages still count, min-wage deducted
}

// Cages tipped is one shared physical count per TEAM per hour — it does not
// sum up across the workers on shift. Every worker on duty that hour is
// credited the same count for pay purposes (not split, not added).
function generateTeamCages(team, date) {
  const hours = getWorkingHours(team, date)
  const rand = mulberry32(seedFor(`team-${team}`, date))
  return hours.map((hour) => {
    const dip = rand() < 0.22
    const cages = dip ? Math.floor(rand() * 4) : 4 + Math.floor(rand() * 3) // 0-3 or 4-6, never above 6
    return { hour, cages }
  })
}

const teamCagesCache = new Map()
function getTeamDailyHours(team, date) {
  const key = `${team}|${date}`
  if (!teamCagesCache.has(key)) {
    teamCagesCache.set(key, generateTeamCages(team, date))
  }
  return teamCagesCache.get(key)
}

// Raw per-worker, per-date hourly log: the worker's team's shared hourly
// count, unless this specific worker was on leave that day.
export function getDailyLog(workerId, date) {
  const leave = LEAVE_EVENTS[`${workerId}|${date}`]
  const worker = workers.find((w) => w.id === workerId)
  const team = worker.team ?? 'A' // Station Head follows Team A's rotation for this demo

  if (leave?.type === 'annual') {
    return { leave: 'annual', hours: [] }
  }

  if (leave?.type === 'unpaid' && worker.role !== 'Station Head') {
    return { leave: 'unpaid', hours: [] }
  }

  return { leave: leave?.type ?? null, hours: getTeamDailyHours(team, date) }
}

// Monthly summary per worker, following the attendance and leave rules per role.
export function getSummary() {
  return workers.map((worker) => {
    let baseCages = 0
    let bonusCages = 0
    let leaveDays = 0
    let leaveAdjustment = 0

    for (const date of sampleDates) {
      const log = getDailyLog(worker.id, date)

      if (log.leave === 'annual') {
        leaveDays += 1
        leaveAdjustment += MIN_WAGE_DAILY
        continue
      }

      if (log.leave === 'unpaid' && worker.role !== 'Station Head') {
        leaveDays += 1
        continue
      }

      const { baseCages: b, bonusCages: bo } = computeShiftBuckets(log.hours)
      baseCages += b
      bonusCages += bo

      if (log.leave === 'unpaid' && worker.role === 'Station Head') {
        leaveDays += 1
        leaveAdjustment -= MIN_WAGE_DAILY
      }
    }

    const piecePay = computePay({ baseCages, bonusCages }, worker.rate)
    const totalPayout = piecePay + leaveAdjustment

    return {
      ...worker,
      baseCages,
      bonusCages,
      totalCages: baseCages + bonusCages,
      piecePay,
      leaveDays,
      leaveAdjustment,
      totalPayout,
    }
  })
}

// Team-wide hourly log across the whole tracked period. Rows always cover
// all 24 hour slots (matching the source sheet's fixed template) — which
// slots actually have cages depends on that team's day/night rotation for
// each date, so the same table naturally shows different rows filled in
// from week to week. Each cell is the team's single shared hourly count —
// not summed across workers.
function buildTeamHourlyLog(team) {
  const grid = {}
  const qualified = {}
  HOUR_SLOTS.forEach((hour) => {
    grid[hour] = {}
    qualified[hour] = {}
    sampleDates.forEach((date) => {
      grid[hour][date] = 0
    })
  })

  sampleDates.forEach((date) => {
    const sequence = getTeamDailyHours(team, date)

    sequence.forEach(({ hour, cages }) => {
      grid[hour][date] = cages
    })

    // Highlight uses the strict monitoring rule (no first-hour exemption) —
    // only computed within the hours actually worked that date, so the
    // mostly-zero rest of the 24-slot row doesn't break the sequence.
    const highlighted = computeHighlightedHours(sequence)
    sequence.forEach(({ hour }) => {
      qualified[hour][date] = highlighted[hour]
    })
  })

  const rowTotals = {}
  const baseBucketByRow = {}
  const bonusBucketByRow = {}
  let grandTotal = 0
  let baseBucketTotal = 0
  let bonusBucketTotal = 0

  HOUR_SLOTS.forEach((hour) => {
    let rowTotal = 0
    let rowBase = 0
    let rowBonus = 0
    sampleDates.forEach((date) => {
      const cages = grid[hour][date]
      rowTotal += cages
      const bucket = bucketHourlyTotal(cages)
      if (bucket === 'base') rowBase += cages
      if (bucket === 'bonus') rowBonus += cages
    })
    rowTotals[hour] = rowTotal
    baseBucketByRow[hour] = rowBase
    bonusBucketByRow[hour] = rowBonus
    grandTotal += rowTotal
    baseBucketTotal += rowBase
    bonusBucketTotal += rowBonus
  })

  const colTotals = {}
  const baseBucketByCol = {}
  const bonusBucketByCol = {}
  sampleDates.forEach((date) => {
    let colTotal = 0
    let colBase = 0
    let colBonus = 0
    HOUR_SLOTS.forEach((hour) => {
      const cages = grid[hour][date]
      colTotal += cages
      const bucket = bucketHourlyTotal(cages)
      if (bucket === 'base') colBase += cages
      if (bucket === 'bonus') colBonus += cages
    })
    colTotals[date] = colTotal
    baseBucketByCol[date] = colBase
    bonusBucketByCol[date] = colBonus
  })

  return {
    team,
    hourSlots: HOUR_SLOTS,
    dates: sampleDates,
    grid,
    qualified,
    rowTotals,
    colTotals,
    baseBucketByRow,
    bonusBucketByRow,
    baseBucketByCol,
    bonusBucketByCol,
    grandTotal,
    baseBucketTotal,
    bonusBucketTotal,
  }
}

// Team-level hourly log — the shared hourly cages count for the whole crew
// on that team, for the whole tracked period. Matches the "Cages Tip
// Hourly" sheet's own shape (Shift A / Shift B tables).
export function getStationHourlyLog(team) {
  return buildTeamHourlyLog(team)
}

// Crew-wide total for a team (used by the two summary tiles at the top of
// the page) — a simple "how much has this team tipped so far" KPI.
export function getShiftTotal(team) {
  return getStationHourlyLog(team).grandTotal
}
