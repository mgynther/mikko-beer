export interface Brewery {
  id: string
  name: string
}

interface BreweryRequest {
  name: string
}

export type CreateBreweryRequest = BreweryRequest
export type UpdateBreweryRequest = BreweryRequest
