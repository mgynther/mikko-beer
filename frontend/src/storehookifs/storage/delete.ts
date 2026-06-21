import type { DeleteStorageHookIf } from '../../core/storage/types'
import { useDeleteStorageMutation } from '../../store/storage/api'

const deleteStorage: () => DeleteStorageHookIf = () => {
  const deleteStorageIf: DeleteStorageHookIf = {
    useDelete: () => {
      const [deleteStorage] = useDeleteStorageMutation()
      return {
        delete: async (id: string): Promise<void> => {
          await deleteStorage(id)
        },
      }
    },
  }
  return deleteStorageIf
}

export default deleteStorage
