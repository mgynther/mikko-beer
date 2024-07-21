import type {
  Brewery,
  SelectBreweryIf
} from '../brewery/types'
import type {
  SelectStyleIf,
  Style
} from '../style/types'

export interface CreateBeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

export interface Beer {
  id: string
  name: string
  breweries: Brewery[]
  styles: Style[]
}

export interface BeerWithIds {
  id: string
  name: string
  breweries: string[]
  styles: string[]
}

export interface BeerList {
  beers: Beer[]
}

export interface CreateBeerIf {
  useCreate: () => {
    create: (request: CreateBeerRequest) => Promise<BeerWithIds>
    isLoading: boolean
  },
  editBeerIf: EditBeerIf
}

export interface UpdateBeerIf {
  useUpdate: () => {
    update: (request: BeerWithIds) => Promise<void>
    isLoading: boolean
  },
  editBeerIf: EditBeerIf
}

export interface GetBeerIf {
  useGetBeer: (beerId: string) => {
    beer: Beer | undefined
    isLoading: boolean
  }
}

export interface EditBeerIf {
  selectBreweryIf: SelectBreweryIf
  selectStyleIf: SelectStyleIf
}

export interface SearchBeerIf {
  useSearch: () => {
    search: (query: string) => Promise<Beer[]>
    isLoading: boolean
  }
}

export interface SelectBeerIf {
  create: CreateBeerIf
  search: SearchBeerIf
}
