import type { ListStoragesHookIf } from '../../types/storage/types'
import { useListStoragesQuery } from '../../store/storage/api'
import { validateStorageListOrUndefined } from '../../validation/storage'

const listStorages: () => ListStoragesHookIf = () => {
  const listStoragesIf: ListStoragesHookIf = {
    useList: () => {
      const { data, isLoading } = useListStoragesQuery()
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listStoragesIf
}

export default listStorages
