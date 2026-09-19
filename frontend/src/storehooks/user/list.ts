import type {
  ListUsersHookIf,
  UseListUsers,
  ValidateUserListOrUndefined,
} from './types'

const listUsers: (
  useListUsers: UseListUsers,
  validateUserListOrUndefined: ValidateUserListOrUndefined,
) => ListUsersHookIf = (useListUsers, validateUserListOrUndefined) => {
  const listUsersIf: ListUsersHookIf = {
    useList: () => {
      const { data, isLoading } = useListUsers()
      return {
        data: validateUserListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listUsersIf
}

export default listUsers
