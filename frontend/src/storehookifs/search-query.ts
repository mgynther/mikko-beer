export function formatQuery(rawQuery: string): string {
  return rawQuery.trim().replace(/\s+/g, ' ')
}
