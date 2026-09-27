import type { Pagination } from '../pagination.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../request.js'

export interface CreatedOrUpdatedBeer {
  id: string
  name: string
  breweries: string[]
  styles: string[]
}

export interface ReadBeer {
  id: string
  name: string
  breweries: Array<{
    id: string
    name: string
  }>
  styles: Array<{
    id: string
    name: string
  }>
}

export interface BeerBody {
  beer: CreatedOrUpdatedBeer
}

export interface ReadBeerBody {
  beer: ReadBeer
}

export interface BeerListBody {
  beers: ReadBeer[]
  pagination: Pagination
}

export interface BeerSearchBody {
  beers: ReadBeer[]
}

export interface BeerHandlers {
  create: (request: BodyRequest) => Promise<BeerBody>
  update: (request: IdBodyRequest) => Promise<BeerBody>
  find: (request: IdRequest) => Promise<ReadBeerBody>
  list: (request: PaginationRequest) => Promise<BeerListBody>
  search: (request: BodyRequest) => Promise<BeerSearchBody>
}
