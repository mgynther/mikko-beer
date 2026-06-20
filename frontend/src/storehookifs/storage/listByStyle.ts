import type { ListStoragesByHookIf } from '../../core/storage/types'
import { useListStoragesByStyleQuery } from '../../store/storage/api'
import { validateStorageListOrUndefined } from '../../validation/storage'

const listStoragesByStyle: () => ListStoragesByHookIf = () => {
  const listStoragesByStyleIf: ListStoragesByHookIf = {
    useList: (breweryId: string) => {
      const { data, isLoading } = useListStoragesByStyleQuery(breweryId)
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listStoragesByStyleIf
}

export default listStoragesByStyle
