import type { ParsedUrlQuery } from 'node:querystring'

// A parameter given more than once is rejected rather than one of its
// values picked, so that which value applied is never in doubt.
export function singleValues(
  query: ParsedUrlQuery,
  rejectRepeated: () => never,
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {}
  Object.keys(query).forEach((key: string): void => {
    const value = query[key]
    if (Array.isArray(value)) {
      rejectRepeated()
    }
    result[key] = value
  })
  return result
}
