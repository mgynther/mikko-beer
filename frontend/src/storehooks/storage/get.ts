import type {
  GetStorageHookIf,
  UseGetStorage,
  ValidateStorageOrUndefined,
} from './types'
import { unwrapMemberOrUndefined } from '../envelope'

const getStorage: (
  useGetStorage: UseGetStorage,
  validateStorageOrUndefined: ValidateStorageOrUndefined,
) => GetStorageHookIf = (useGetStorage, validateStorageOrUndefined) => {
  const getStorageIf: GetStorageHookIf = {
    useGet: (storageId: string) => {
      const { data, isLoading } = useGetStorage(storageId)
      return {
        storage: validateStorageOrUndefined(
          unwrapMemberOrUndefined(data, 'storage'),
        ),
        isLoading,
      }
    },
  }
  return getStorageIf
}

export default getStorage
