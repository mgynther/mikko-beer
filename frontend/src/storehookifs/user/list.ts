import type { ListUsersIf } from "../../core/user/types"
import { useListUsersQuery } from "../../store/user/api"
import { validateUserListOrUndefined } from "../../validation/user"

const listUsers: () => ListUsersIf = () => {
  const listUsersIf: ListUsersIf = {
    useList: () => {
      const { data, isLoading } = useListUsersQuery()
      return {
        data: validateUserListOrUndefined(data),
        isLoading
      }
    }
  }
  return listUsersIf
}

export default listUsers
