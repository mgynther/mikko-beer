import type {
  ContainerRequest,
  CreateContainerIf
} from "../../core/container/types"
import { useCreateContainerMutation } from "../../store/container/api"

const createContainer: () => CreateContainerIf = () => {
  const createContainerIf: CreateContainerIf = {
    useCreate: () => {
      const [
        createContainer,
        { isLoading: isCreatingContainer }
      ] = useCreateContainerMutation()
      return {
        create: async (containerRequest: ContainerRequest) =>
          (await createContainer(containerRequest).unwrap()).container,
        isLoading: isCreatingContainer
      }
    }
  }
  return createContainerIf
}

export default createContainer
