import type {
  AuthorizedRequest,
  BodyRequest,
  IdBodyRequest,
  IdRequest,
} from '../request.js'

export interface CreatedOrUpdatedStyle {
  id: string
  name: string
  parents: string[]
}

export interface ReadStyle {
  id: string
  name: string
  children: Array<{
    id: string
    name: string
  }>
  parents: Array<{
    id: string
    name: string
  }>
}

export interface ListedStyle {
  id: string
  name: string
  parents: string[]
}

export interface StyleBody {
  style: CreatedOrUpdatedStyle
}

export interface ReadStyleBody {
  style: ReadStyle
}

export interface StyleListBody {
  styles: ListedStyle[]
}

export interface StyleHandlers {
  create: (request: BodyRequest) => Promise<StyleBody>
  update: (request: IdBodyRequest) => Promise<StyleBody>
  find: (request: IdRequest) => Promise<ReadStyleBody>
  list: (request: AuthorizedRequest) => Promise<StyleListBody>
}
