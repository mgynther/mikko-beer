import type {
  AuthorizedRequest,
  BodyRequest,
  IdBodyRequest,
  IdRequest,
} from '../request.js'

export interface CreatedOrUpdatedContainer {
  id: string
  type: string
  size: string
}

export interface ReadContainer {
  id: string
  type: string
  size: string
}

export interface ContainerBody {
  container: CreatedOrUpdatedContainer
}

export interface ReadContainerBody {
  container: ReadContainer
}

export interface ContainerListBody {
  containers: ReadContainer[]
}

export interface ContainerHandlers {
  create: (request: BodyRequest) => Promise<ContainerBody>
  update: (request: IdBodyRequest) => Promise<ContainerBody>
  find: (request: IdRequest) => Promise<ReadContainerBody>
  list: (request: AuthorizedRequest) => Promise<ContainerListBody>
}
