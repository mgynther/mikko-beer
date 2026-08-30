import { ajv } from './internal/ajv.js'

import { invalidSearchError } from './errors.js'

export interface SearchByName {
  name: string
}

const doValidateSearchByNameRequest = ajv.compile<SearchByName>({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['name'],
  additionalProperties: false,
})

export function validateSearchByName(body: unknown): SearchByName {
  if (!doValidateSearchByNameRequest(body)) {
    throw invalidSearchError
  }
  const name: string = (body as { name: string }).name
  return { name }
}
