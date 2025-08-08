export function parseExpiryDurationMin(strDurationMin: string): number {
  if (!/^[0-9]+$/.test(strDurationMin)) {
    throw new Error(`invalid expiry duration ${strDurationMin}`)
  }
  return parseInt(strDurationMin)
}
