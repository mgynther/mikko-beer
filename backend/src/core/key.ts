export function areKeysEqual (a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false
  }
  return a.every((key: string) => b.includes(key))
}
