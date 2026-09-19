import type { DeleteUserHookIf, UseDeleteUser } from './types'

const deleteUser: (useDeleteUser: UseDeleteUser) => DeleteUserHookIf = (
  useDeleteUser,
) => {
  const deleteUserIf: DeleteUserHookIf = {
    useDelete: () => {
      const { delete: deleteById } = useDeleteUser()
      return {
        delete: async (userId: string): Promise<void> => {
          await deleteById(userId)
        },
      }
    },
  }
  return deleteUserIf
}

export default deleteUser
