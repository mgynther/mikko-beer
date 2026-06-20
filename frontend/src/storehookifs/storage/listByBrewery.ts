import type { ListStoragesByHookIf } from '../../core/storage/types'
import { useListStoragesByBreweryQuery } from '../../store/storage/api'
import { validateStorageListOrUndefined } from '../../validation/storage'

const listStoragesByBrewery: () => ListStoragesByHookIf = () => {
  const listStoragesByBreweryIf: ListStoragesByHookIf = {
    useList: (breweryId: string) => {
      const { data, isLoading } = useListStoragesByBreweryQuery(breweryId)
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listStoragesByBreweryIf
}

export default listStoragesByBrewery
