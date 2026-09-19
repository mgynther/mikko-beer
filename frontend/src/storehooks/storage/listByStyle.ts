import type {
  ListStoragesByHookIf,
  UseListStoragesBy,
  ValidateStorageListOrUndefined,
} from './types'

const listStoragesByStyle: (
  useListStoragesByStyle: UseListStoragesBy,
  validateStorageListOrUndefined: ValidateStorageListOrUndefined,
) => ListStoragesByHookIf = (
  useListStoragesByStyle,
  validateStorageListOrUndefined,
) => {
  const listStoragesByStyleIf: ListStoragesByHookIf = {
    useList: (id: string) => {
      const { data, isLoading } = useListStoragesByStyle(id)
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listStoragesByStyleIf
}

export default listStoragesByStyle
