export interface CreateBreweryRequest {
  name: string
  country: string | undefined
}

export interface UpdateBreweryRequest extends CreateBreweryRequest {
  id: string
}
