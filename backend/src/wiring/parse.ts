export function parseExpiryDurationMin(strDurationMin: string): number {
  if (!/^[0-9]+$/v.test(strDurationMin)) {
    throw new Error(`invalid expiry duration ${strDurationMin}`)
  }
  return parseInt(strDurationMin, 10)
}
