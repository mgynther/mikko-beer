export function getDate(): Date {
  return new Date()
}

export function getNextMonthDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}
