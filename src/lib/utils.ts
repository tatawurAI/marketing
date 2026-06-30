// Utility functions

export function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// DATE fields from Postgres arrive as "YYYY-MM-DD"; TIMESTAMPTZ fields arrive
// with a "T" already in the string. Appending "T00:00:00Z" to a TIMESTAMPTZ
// produces an invalid date, so we detect the format before parsing.
export function formatPortalDate(dateStr: string): string {
  const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
