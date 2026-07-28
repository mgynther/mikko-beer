export const defaultSearchMaxResults = 20

export interface SearchByName {
  name: string
}

export function toIlike(search: SearchByName): string {
  // To be absolutely sure type assertions or other bad practices do not cause
  // unexpected values ending up in queries we do run-time validation here.
  const nameStr: string = search.name
  const name: string | null | undefined = nameStr as string | null | undefined
  if (!name) {
    throw new Error('must not search with missing or empty name')
  }
  if (/^".*"$/v.test(name)) {
    return name.substring(1, name.length - 1)
  }
  return `%${name}%`
}
