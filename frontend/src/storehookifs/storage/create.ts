import type {
  CreateStorageIf,
  CreateStorageRequest,
  CreatedStorage,
} from '../../core/storage/types'
import { useCreateStorageMutation } from '../../store/storage/api'
import { validateCreatedStorage } from '../../validation/storage'

const createStorage: () => CreateStorageIf = () => {
  const createStorageIf: CreateStorageIf = {
    useCreate: () => {
      const [createStorage, { error, isLoading }] = useCreateStorageMutation()
      return {
        create: async (
          request: CreateStorageRequest,
        ): Promise<CreatedStorage> => {
          const result = await createStorage(request).unwrap()
          return validateCreatedStorage(result.storage)
        },
        hasError: error !== undefined,
        isLoading,
      }
    },
  }
  return createStorageIf
}

export default createStorage
