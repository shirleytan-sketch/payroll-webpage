const currencyFormatter = new Intl.NumberFormat('en-MY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatRM(value, { signed = false } = {}) {
  const sign = signed && value < 0 ? '−' : signed && value > 0 ? '+' : ''
  return `${sign}RM ${currencyFormatter.format(Math.abs(value))}`
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-MY').format(value)
}
