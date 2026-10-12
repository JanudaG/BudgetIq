const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// 2400 -> "$2,400.00"
export function formatCurrency(amount) {
  return currency.format(amount)
}

// "2026-10-21" -> "Oct 21"
// Dates are stored as plain "YYYY-MM-DD" strings. We read them as UTC and
// format as UTC so the day never shifts because of the viewer's timezone.
export function formatShortDate(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

// "2026-10-21" -> "21 Oct 2026"
export function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// Today as "YYYY-MM-DD" in the user's own timezone (what <input type="date"> uses)
export function todayISO() {
  return new Date().toLocaleDateString('en-CA')
}
