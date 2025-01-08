export interface Location {
  id: string
  name: string
}

interface LocationRequest {
  name: string
}

export type CreateLocationRequest = LocationRequest
export type UpdateLocationRequest = LocationRequest
