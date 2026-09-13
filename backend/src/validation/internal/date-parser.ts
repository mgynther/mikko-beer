export function parseDate(timestamp: unknown): Date | undefined {
  if (typeof timestamp !== 'string') {
    return undefined
  }
  if (timestamp.length === 0) {
    return undefined
  }
  const numValue = parseInt(timestamp)
  if (!isNaN(numValue) && validateTimestamp(numValue)) {
    return new Date(numValue)
  }
  return undefined
}

const validateTimestamp = (value: number): boolean =>
  value <= Infinity && value >= 0
