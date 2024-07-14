export interface CreateUserRequest {
  user: {
    role: string
  }
  passwordSignInMethod: {
    username: string
    password: string
  }
}

export interface User {
  id: string
  username: string
  role: string
}

export enum Role {
  admin = 'admin',
  viewer = 'viewer',
}

export interface UserList {
  users: User[]
}

export interface CreateUserIf {
  useCreate: () => {
    create: (user: CreateUserRequest) => Promise<void>
    user: User | undefined
    hasError: boolean
    isLoading: boolean
  }
}

interface ListUsersData {
  data: UserList | undefined,
  isLoading: boolean
}

export interface ListUsersIf {
  useList: () => ListUsersData
}

export interface UserIf {
  create: CreateUserIf
  list: ListUsersIf
  delete: (userId: string) => Promise<void>
}
