import type { Container, UpdateContainerIf } from "../../core/container/types"
import { useUpdateContainerMutation } from "../../store/container/api"

const updateContainer: () => UpdateContainerIf = () => {
  const updateContainerIf: UpdateContainerIf = {
    useUpdate: () => {
      const [updateContainer, { isLoading: isUpdatingContainer }] =
        useUpdateContainerMutation()
      return {
        update: async (container: Container) => {
          await updateContainer(container)
        },
        isLoading: isUpdatingContainer
      }
    }
  }
  return updateContainerIf
}

export default updateContainer
