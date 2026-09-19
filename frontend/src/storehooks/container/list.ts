import type {
  ListContainersHookIf,
  UseListContainers,
  ValidateContainerListOrUndefined,
} from './types'

const listContainers: (
  useListContainers: UseListContainers,
  validateContainerListOrUndefined: ValidateContainerListOrUndefined,
) => ListContainersHookIf = (
  useListContainers,
  validateContainerListOrUndefined,
) => {
  const listContainersIf: ListContainersHookIf = {
    useList: () => {
      const { data, isLoading } = useListContainers()
      return {
        data: validateContainerListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listContainersIf
}

export default listContainers
