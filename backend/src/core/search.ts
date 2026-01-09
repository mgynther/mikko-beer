import { ajv } from './internal/ajv'

import { invalidSearchError } from './errors'

export const defaultSearchMaxResults = 20

export interface SearchByName {
  name: string
}

export function toIlike (search: SearchByName): string {
  // To be absolutely sure type assertions or other bad practices do not cause
  // unexpected values ending up in queries we do run-time validation here.
  const nameStr: string = search.name
  const name: string | null | undefined = nameStr as string | null | undefined
  if (name === null ||
      name === undefined ||
      name.length === 0) {
    throw new Error('must not search with missing or empty name')
  }
  if (/^".*"$/v.test(name)) {
    return name.substring(1, name.length - 1)
  }
  return `%${name}%`
}

const doValidateSearchByNameRequest =
  ajv.compile<SearchByName>({
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1
      }
    },
    required: ['name'],
    additionalProperties: false
  })

export function validateSearchByName (body: unknown): SearchByName {
  if (!(doValidateSearchByNameRequest(body))) {
    throw invalidSearchError
  }
  const name: string = (body as { name: string }).name
  return { name }
}
