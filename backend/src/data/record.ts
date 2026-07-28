export function contains<T>(record: Record<string, T>, key: string): boolean {
  return record[key] !== undefined
}
