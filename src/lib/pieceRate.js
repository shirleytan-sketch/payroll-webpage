// Shared piece-rate calculation for cage-tipping stations (FFB Reception,
// Press & Threshing, EB) — mirrors the "Hourly first 4 cages" / "Subsequent
// cages" rule from the piece rate master:
//
//   - Cages 1-4 in an hour: base rate.
//   - Cages 5+ in an hour: bonus rate, but ONLY if the previous hour (within
//     the same shift) also had >=4 cages. The very first hour of a shift is
//     exempt from that requirement (there is no prior hour to check).
//   - If the bonus condition isn't met, cages 5+ still get paid — just at
//     the base rate instead of the bonus rate. No cage ever goes unpaid.

export const MIN_WAGE_MONTHLY = 1700
export const MIN_WAGE_WORKING_DAYS = 26
export const MIN_WAGE_DAILY = MIN_WAGE_MONTHLY / MIN_WAGE_WORKING_DAYS

const BONUS_THRESHOLD = 4

// hours: ordered array of { hour, cages } for one worker's one shift on one day.
// Returns the same entries enriched with baseCages/bonusCages/qualified, plus totals.
export function computeShiftBuckets(hours) {
  let baseCages = 0
  let bonusCages = 0
  const rows = hours.map((entry, i) => {
    const prevCages = i === 0 ? null : hours[i - 1].cages
    const qualifies = i === 0 || (prevCages !== null && prevCages >= BONUS_THRESHOLD)
    const rowBase = Math.min(entry.cages, BONUS_THRESHOLD)
    const rowBonus = qualifies ? Math.max(entry.cages - BONUS_THRESHOLD, 0) : 0
    const rowBaseExtra = qualifies ? 0 : Math.max(entry.cages - BONUS_THRESHOLD, 0)
    baseCages += rowBase + rowBaseExtra
    bonusCages += rowBonus
    return {
      ...entry,
      baseCages: rowBase + rowBaseExtra,
      bonusCages: rowBonus,
      bonusQualified: qualifies && entry.cages > BONUS_THRESHOLD,
    }
  })
  return { rows, baseCages, bonusCages }
}

export function computePay({ baseCages, bonusCages }, rate) {
  return baseCages * rate.base + bonusCages * rate.bonus
}

// Simple per-hour volume bucket for the monitoring log (distinct from the
// streak-aware payroll rule above) — mirrors the "1-4 cages/hr" / ">5
// cages/hr" tally rows on the source hourly cages sheet.
export function bucketHourlyTotal(cages) {
  if (cages <= 0) return null
  return cages <= BONUS_THRESHOLD ? 'base' : 'bonus'
}

// Highlight rule for the Hourly Cages Log (monitoring view only): a cell is
// only highlighted when this hour has 5+ cages AND the immediately prior
// hour had 4+ cages. Unlike the payroll rule above, there is NO first-hour
// exemption here — the first hour of a shift never highlights, since there's
// no prior hour to satisfy the condition.
export function computeHighlightedHours(hours) {
  const highlighted = {}
  hours.forEach((entry, i) => {
    const prevCages = i === 0 ? null : hours[i - 1].cages
    highlighted[entry.hour] = prevCages !== null && prevCages >= BONUS_THRESHOLD && entry.cages > BONUS_THRESHOLD
  })
  return highlighted
}
