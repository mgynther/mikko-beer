import type { CreateUserRequest } from './internal/user/requests'
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useListUsersQuery,
} from './internal/user/api'

// The public surface of the user endpoints. See store/beer.ts for why every
// result is built here rather than handed on as the query hook returned it.
export interface ListUsersResult {
  data: unknown
  isLoading: boolean
}

// Creating a user does not unwrap its response: a failed creation is reported
// through hasError rather than thrown, which is what the form that calls it
// reads.
export interface CreateUserResult {
  create: (user: CreateUserRequest) => Promise<void>
  data: unknown
  hasError: boolean
  isLoading: boolean
}

export interface DeleteUserResult {
  delete: (userId: string) => Promise<void>
}

export function useListUsers(): ListUsersResult {
  const { data, isLoading } = useListUsersQuery()
  return {
    data,
    isLoading,
  }
}

export function useCreateUser(): CreateUserResult {
  const [createUser, { data, error, isLoading }] = useCreateUserMutation()
  return {
    create: async (user: CreateUserRequest): Promise<void> => {
      await createUser(user)
    },
    data,
    hasError: error !== undefined,
    isLoading,
  }
}

export function useDeleteUser(): DeleteUserResult {
  const [deleteUser] = useDeleteUserMutation()
  return {
    delete: async (userId: string): Promise<void> => {
      await deleteUser(userId)
    },
  }
}
