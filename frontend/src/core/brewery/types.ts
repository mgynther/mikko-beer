export interface CreateBreweryRequest {
  name: string
}

export interface Brewery {
  id: string
  name: string
}

export interface BreweryList {
  breweries: Brewery[]
}

export interface CreateBreweryIf {
  useCreate: () => {
    create: (breweryRequest: CreateBreweryRequest) => Promise<Brewery>
    isLoading: boolean
  }
}

export interface SearchBreweryIf {
  useSearch: () => {
    search: (name: string) => Promise<Brewery[]>,
    isLoading: boolean
  }
}

export interface SelectBreweryIf {
  create: CreateBreweryIf,
  search: SearchBreweryIf
}
