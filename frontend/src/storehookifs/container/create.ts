import type {
  ContainerRequest,
  CreateContainerIf
} from "../../core/container/types"
import { useCreateContainerMutation } from "../../store/container/api"
import { validateContainer } from "../../validation/container"

const createContainer: () => CreateContainerIf = () => {
  const createContainerIf: CreateContainerIf = {
    useCreate: () => {
      const [
        createContainer,
        { isLoading: isCreatingContainer }
      ] = useCreateContainerMutation()
      return {
        create: async (containerRequest: ContainerRequest) => {
          const result = await createContainer(containerRequest).unwrap()
          return validateContainer(result.container)
        },
        isLoading: isCreatingContainer
      }
    }
  }
  return createContainerIf
}

export default createContainer
