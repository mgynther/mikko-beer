import type {
  ListStoragesByHookIf,
  UseListStoragesBy,
  ValidateStorageListOrUndefined,
} from './types'

const listStoragesByBeer: (
  useListStoragesByBeer: UseListStoragesBy,
  validateStorageListOrUndefined: ValidateStorageListOrUndefined,
) => ListStoragesByHookIf = (
  useListStoragesByBeer,
  validateStorageListOrUndefined,
) => {
  const listStoragesByBeerIf: ListStoragesByHookIf = {
    useList: (id: string) => {
      const { data, isLoading } = useListStoragesByBeer(id)
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listStoragesByBeerIf
}

export default listStoragesByBeer
