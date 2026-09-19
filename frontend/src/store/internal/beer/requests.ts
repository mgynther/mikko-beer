export interface CreateBeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

export interface UpdateBeerRequest extends CreateBeerRequest {
  id: string
}
