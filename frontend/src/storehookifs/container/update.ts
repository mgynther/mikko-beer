import type { Container, UpdateContainerIf } from '../../core/container/types'
import { useUpdateContainerMutation } from '../../store/container/api'
import { validateContainer } from '../../validation/container'

const updateContainer: () => UpdateContainerIf = () => {
  const updateContainerIf: UpdateContainerIf = {
    useUpdate: () => {
      const [updateContainer, { isLoading: isUpdatingContainer }] =
        useUpdateContainerMutation()
      return {
        update: async (container: Container): Promise<void> => {
          const result = await updateContainer(container).unwrap()
          validateContainer(result.container)
        },
        isLoading: isUpdatingContainer,
      }
    },
  }
  return updateContainerIf
}

export default updateContainer
