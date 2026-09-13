import { ajv } from './internal/ajv.js'

export interface SearchByName {
  name: string
}

export type SearchByNameValidationResult =
  | {
      errorCode: 'invalid-search'
      result: undefined
    }
  | {
      errorCode: undefined
      result: SearchByName
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

export function validateSearchByName(
  body: unknown,
): SearchByNameValidationResult {
  if (!doValidateSearchByNameRequest(body)) {
    return { errorCode: 'invalid-search', result: undefined }
  }

  const name: string = (body as { name: string }).name
  return { errorCode: undefined, result: { name } }
}
