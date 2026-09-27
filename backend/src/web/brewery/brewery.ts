import type { Pagination } from '../pagination.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../request.js'

export interface CreatedOrUpdatedBrewery {
  id: string
  name: string
  country: string | undefined
}

export interface ReadBrewery {
  id: string
  name: string
  country: string | undefined
}

export interface BreweryBody {
  brewery: CreatedOrUpdatedBrewery
}

export interface ReadBreweryBody {
  brewery: ReadBrewery
}

export interface BreweryListBody {
  breweries: ReadBrewery[]
  pagination: Pagination
}

export interface BrewerySearchBody {
  breweries: ReadBrewery[]
}

export interface BreweryHandlers {
  create: (request: BodyRequest) => Promise<BreweryBody>
  update: (request: IdBodyRequest) => Promise<BreweryBody>
  find: (request: IdRequest) => Promise<ReadBreweryBody>
  list: (request: PaginationRequest) => Promise<BreweryListBody>
  search: (request: BodyRequest) => Promise<BrewerySearchBody>
}
