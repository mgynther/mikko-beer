// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/. See the comment in
// storehooks/style/types.ts.
//
// The role is a string here, the way it is in the store's request: which
// roles exist is the application's business. The caller's Role is a string
// enum and therefore satisfies it.
export interface User {
  id: string
  username: string
  role: string
}

export interface UserList {
  users: User[]
}

export interface CreateUserRequest {
  user: {
    role: string
  }
  passwordSignInMethod: {
    username: string
    password: string
  }
}

// The store functions these hooks are given. See the comment in
// storehooks/brewery/types.ts.
export type UseListUsers = () => {
  data: unknown
  isLoading: boolean
}

export type UseCreateUser = () => {
  create: (user: CreateUserRequest) => Promise<void>
  data: unknown
  hasError: boolean
  isLoading: boolean
}

export type UseDeleteUser = () => {
  delete: (userId: string) => Promise<void>
}

export type ValidateUserOrUndefined = (result: unknown) => User | undefined

export type ValidateUserListOrUndefined = (
  result: unknown,
) => UserList | undefined

export interface CreateUserHookIf {
  useCreate: () => {
    create: (user: CreateUserRequest) => Promise<void>
    user: User | undefined
    hasError: boolean
    isLoading: boolean
  }
}

export interface ListUsersHookIf {
  useList: () => {
    data: UserList | undefined
    isLoading: boolean
  }
}

export interface DeleteUserHookIf {
  useDelete: () => {
    delete: (userId: string) => Promise<void>
  }
}
