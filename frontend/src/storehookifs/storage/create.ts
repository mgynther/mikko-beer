import type {
  CreateStorageIf,
  CreateStorageRequest
} from "../../core/storage/types"
import { useCreateStorageMutation } from "../../store/storage/api"

const createStorage: () => CreateStorageIf = () => {
  const createStorageIf: CreateStorageIf = {
    useCreate: () => {
      const [createStorage, { error, isLoading }] =
        useCreateStorageMutation()
      return {
        create: async (request: CreateStorageRequest) => {
          await createStorage(request)
        },
        hasError: error !== undefined,
        isLoading
      }
    }
  }
  return createStorageIf
}

export default createStorage
