import type {
  CreateStorageIf,
  CreateStorageRequest
} from "../../core/storage/types"
import { useCreateStorageMutation } from "../../store/storage/api"
import { validateStorage } from "../../validation/storage"

const createStorage: () => CreateStorageIf = () => {
  const createStorageIf: CreateStorageIf = {
    useCreate: () => {
      const [createStorage, { error, isLoading }] =
        useCreateStorageMutation()
      return {
        create: async (request: CreateStorageRequest): Promise<void> => {
          const result = await createStorage(request).unwrap()
          validateStorage(result.storage)
        },
        hasError: error !== undefined,
        isLoading
      }
    }
  }
  return createStorageIf
}

export default createStorage
