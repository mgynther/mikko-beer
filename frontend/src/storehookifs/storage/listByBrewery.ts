import type {
  DeleteStorageIf,
  ListStoragesByIf
} from "../../core/storage/types"
import { useListStoragesByBreweryQuery } from "../../store/storage/api"
import { validateStorageListOrUndefined } from "../../validation/storage"

const listStoragesByBrewery: (
  deleteStorageIf: DeleteStorageIf
) => ListStoragesByIf = (
  deleteStorageIf: DeleteStorageIf
) => {
  const listStoragesByBreweryIf: ListStoragesByIf = {
    useList: (breweryId: string) => {
      const { data, isLoading } = useListStoragesByBreweryQuery(breweryId)
      return {
        storages: validateStorageListOrUndefined(data),
        isLoading
      }
    },
    delete: deleteStorageIf
  }
  return listStoragesByBreweryIf
}

export default listStoragesByBrewery
