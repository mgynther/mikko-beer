import type {
  ListStoragesByHookIf,
  UseListStoragesBy,
  ValidateStorageListOrUndefined,
} from './types'

const listStoragesByBrewery: (
  useListStoragesByBrewery: UseListStoragesBy,
  validateStorageListOrUndefined: ValidateStorageListOrUndefined,
) => ListStoragesByHookIf = (
  useListStoragesByBrewery,
  validateStorageListOrUndefined,
) => {
  const listStoragesByBreweryIf: ListStoragesByHookIf = {
    useList: (id: string) => {
      const { data, isLoading } = useListStoragesByBrewery(id)
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listStoragesByBreweryIf
}

export default listStoragesByBrewery
