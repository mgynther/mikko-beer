import type { DeleteUserIf } from "../../core/user/types"
import { useDeleteUserMutation } from "../../store/user/api"

const deleteUser: () => DeleteUserIf = () => {
  const deleteUserIf: DeleteUserIf = {
    useDelete: () => {
      const [deleteUser] = useDeleteUserMutation()
      return {
        delete: async (userId: string) => {
          await deleteUser(userId)
        }
      }
    }
  }
  return deleteUserIf
}

export default deleteUser
