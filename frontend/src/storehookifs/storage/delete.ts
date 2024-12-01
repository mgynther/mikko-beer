import type { DeleteStorageIf } from "../../core/storage/types"
import { useDeleteStorageMutation } from "../../store/storage/api"

const deleteStorage: () => DeleteStorageIf = () => {
  const deleteStorageIf: DeleteStorageIf = {
    useDelete: () => {
      const [deleteStorage] = useDeleteStorageMutation()
      return {
        delete: async (id: string) => {
          await deleteStorage(id)
        }
      }
    }
  }
  return deleteStorageIf
}

export default deleteStorage
