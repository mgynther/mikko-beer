import type { DeleteStorageHookIf, UseDeleteStorage } from './types'

const deleteStorage: (
  useDeleteStorage: UseDeleteStorage,
) => DeleteStorageHookIf = (useDeleteStorage) => {
  const deleteStorageIf: DeleteStorageHookIf = {
    useDelete: () => {
      const { delete: deleteById } = useDeleteStorage()
      return {
        delete: async (id: string): Promise<void> => {
          await deleteById(id)
        },
      }
    },
  }
  return deleteStorageIf
}

export default deleteStorage
