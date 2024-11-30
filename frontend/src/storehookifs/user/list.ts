import type { ListUsersIf } from "../../core/user/types"
import { useListUsersQuery } from "../../store/user/api"

const listUsers: () => ListUsersIf = () => {
  const listUsersIf: ListUsersIf = {
    useList: () => {
      const { data, isLoading } = useListUsersQuery()
      return {
        data,
        isLoading
      }
    }
  }
  return listUsersIf
}

export default listUsers
