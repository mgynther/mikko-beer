import type { ListStoragesByHookIf } from '../../core/storage/types'
import { useListStoragesByBeerQuery } from '../../store/storage/api'
import { validateStorageListOrUndefined } from '../../validation/storage'

const listStoragesByBeer: () => ListStoragesByHookIf = () => {
  const listStoragesByBeerIf: ListStoragesByHookIf = {
    useList: (beerId: string) => {
      const { data, isLoading } = useListStoragesByBeerQuery(beerId)
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listStoragesByBeerIf
}

export default listStoragesByBeer
