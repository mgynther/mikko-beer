export function asObject(value: unknown): object {
  if (value === null) {
    return {}
  }
  if (typeof value === 'object') {
    return value
  }
  return {}
}
