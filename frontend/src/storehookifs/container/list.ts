import type { ListContainersIf } from "../../core/container/types"
import { useListContainersQuery } from "../../store/container/api"
import { validateContainerListOrUndefined } from "../../validation/container"

const listContainers: () => ListContainersIf = () => {
  const listContainersIf: ListContainersIf = {
    useList: () => {
      const { data, isLoading } = useListContainersQuery()
      return {
        data: validateContainerListOrUndefined(data),
        isLoading
      }
    }
  }
  return listContainersIf
}

export default listContainers
