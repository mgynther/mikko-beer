import { ajv } from './ajv'
import { ControllerError } from './errors'

export interface SearchByName {
  name: string
}

export function toIlike (search: SearchByName): string {
  // To be absolutely sure type assertions or other bad practices do not cause
  // unexpected values ending up in queries we do run-time validation here.
  if (search.name === null ||
      search.name === undefined ||
      search.name.length === 0) {
    throw new Error('must not search with missing or empty name')
  }
  return `%${search.name}%`
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
    throw new ControllerError(
      400, 'InvalidBrewerySearch', 'invalid brewery search'
    )
  }
  const name: string = (body as any).name
  return { name }
}
