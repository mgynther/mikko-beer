export interface Brewery {
  id: string
  name: string
  country: string | undefined
}

interface BreweryRequest {
  name: string
  country: string | undefined
}

export type CreateBreweryRequest = BreweryRequest
export type UpdateBreweryRequest = BreweryRequest

export interface ValidUpdateBreweryRequest {
  id: string
  request: UpdateBreweryRequest
}

export type CreateBreweryValidationResult =
  | {
      errorCode: 'invalid-brewery'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateBreweryRequest
    }

export type ValidateCreateBrewery = (
  body: unknown,
) => CreateBreweryValidationResult

export type UpdateBreweryValidationResult =
  | {
      errorCode: 'invalid-brewery' | 'invalid-brewery-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateBreweryRequest
    }

export type ValidateUpdateBrewery = (
  body: unknown,
  id: string | undefined,
) => UpdateBreweryValidationResult

export type ValidateBreweryIdResult =
  | {
      errorCode: 'invalid-brewery-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

export type ValidateBreweryId = (
  id: string | undefined,
) => ValidateBreweryIdResult
