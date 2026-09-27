import type { AuthorizedRequest, BodyRequest, IdRequest } from '../request.js'

export interface CreatedUser {
  id: string
  role: 'admin' | 'viewer'
  username: string | null
}

export interface ReadUser {
  id: string
  role: 'admin' | 'viewer'
  username: string | null
}

export interface CreatedUserBody {
  user: CreatedUser
  authToken: string
  refreshToken: string
}

export interface ReadUserBody {
  user: ReadUser
}

export interface UserListBody {
  users: ReadUser[]
}

export interface UserHandlers {
  create: (request: BodyRequest) => Promise<CreatedUserBody>
  find: (request: IdRequest) => Promise<ReadUserBody>
  list: (request: AuthorizedRequest) => Promise<UserListBody>
  delete: (request: IdRequest) => Promise<void>
}
