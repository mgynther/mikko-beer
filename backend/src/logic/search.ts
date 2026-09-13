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

export type ValidateSearchByName = (
  body: unknown,
) => SearchByNameValidationResult
