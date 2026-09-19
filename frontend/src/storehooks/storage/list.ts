import type {
  ListStoragesHookIf,
  UseListStorages,
  ValidateStorageListOrUndefined,
} from './types'

const listStorages: (
  useListStorages: UseListStorages,
  validateStorageListOrUndefined: ValidateStorageListOrUndefined,
) => ListStoragesHookIf = (useListStorages, validateStorageListOrUndefined) => {
  const listStoragesIf: ListStoragesHookIf = {
    useList: () => {
      const { data, isLoading } = useListStorages()
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listStoragesIf
}

export default listStorages
