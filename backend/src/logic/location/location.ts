export interface Location {
  id: string
  name: string
}

interface LocationRequest {
  name: string
}

export type CreateLocationRequest = LocationRequest
export type UpdateLocationRequest = LocationRequest

export interface ValidUpdateLocationRequest {
  id: string
  request: UpdateLocationRequest
}

export type CreateLocationValidationResult =
  | {
      errorCode: 'invalid-location'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateLocationRequest
    }

export type ValidateCreateLocation = (
  body: unknown,
) => CreateLocationValidationResult

export type UpdateLocationValidationResult =
  | {
      errorCode: 'invalid-location' | 'invalid-location-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateLocationRequest
    }

export type ValidateUpdateLocation = (
  body: unknown,
  id: string | undefined,
) => UpdateLocationValidationResult

export type ValidateLocationIdResult =
  | {
      errorCode: 'invalid-location-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

export type ValidateLocationId = (
  id: string | undefined,
) => ValidateLocationIdResult
