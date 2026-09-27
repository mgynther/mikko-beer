import type { Pagination } from '../pagination.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../request.js'

export interface CreatedOrUpdatedLocation {
  id: string
  name: string
}

export interface ReadLocation {
  id: string
  name: string
}

export interface LocationBody {
  location: CreatedOrUpdatedLocation
}

export interface ReadLocationBody {
  location: ReadLocation
}

export interface LocationListBody {
  locations: ReadLocation[]
  pagination: Pagination
}

export interface LocationSearchBody {
  locations: ReadLocation[]
}

export interface LocationHandlers {
  create: (request: BodyRequest) => Promise<LocationBody>
  update: (request: IdBodyRequest) => Promise<LocationBody>
  find: (request: IdRequest) => Promise<ReadLocationBody>
  list: (request: PaginationRequest) => Promise<LocationListBody>
  search: (request: BodyRequest) => Promise<LocationSearchBody>
}
