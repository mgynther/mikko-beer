export function round(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return '-'
  }
  const decimals = 2
  return Number(
    `${Math.round(parseFloat(`${value}e${decimals}`))}e-${decimals}`,
  ).toFixed(decimals)
}

export function formatInteger(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return '-'
  }
  return `${Math.round(value)}`
}
