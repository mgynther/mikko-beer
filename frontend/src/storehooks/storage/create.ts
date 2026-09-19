import type {
  CreatedStorage,
  CreateStorageHookIf,
  CreateStorageRequest,
  UseCreateStorage,
  ValidateCreatedStorage,
} from './types'
import { unwrapMember } from '../envelope'

const createStorage: (
  useCreateStorage: UseCreateStorage,
  validateCreatedStorage: ValidateCreatedStorage,
) => CreateStorageHookIf = (useCreateStorage, validateCreatedStorage) => {
  const createStorageIf: CreateStorageHookIf = {
    useCreate: () => {
      const { create, hasError, isLoading } = useCreateStorage()
      return {
        create: async (
          request: CreateStorageRequest,
        ): Promise<CreatedStorage> => {
          const result = await create(request)
          return validateCreatedStorage(unwrapMember(result, 'storage'))
        },
        hasError,
        isLoading,
      }
    },
  }
  return createStorageIf
}

export default createStorage
