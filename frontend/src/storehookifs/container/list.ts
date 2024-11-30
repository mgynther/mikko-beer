import type { ListContainersIf } from "../../core/container/types"
import { useListContainersQuery } from "../../store/container/api"

const listContainers: () => ListContainersIf = () => {
  const listContainersIf: ListContainersIf = {
    useList: () => {
      const { data, isLoading } = useListContainersQuery()
      return {
        data,
        isLoading
      }
    }
  }
  return listContainersIf
}

export default listContainers
