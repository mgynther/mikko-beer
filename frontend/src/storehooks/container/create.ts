import type {
  Container,
  ContainerRequest,
  CreateContainerHookIf,
  UseCreateContainer,
  ValidateContainer,
} from './types'
import { unwrapMember } from '../envelope'

const createContainer: (
  useCreateContainer: UseCreateContainer,
  validateContainer: ValidateContainer,
) => CreateContainerHookIf = (useCreateContainer, validateContainer) => {
  const createContainerIf: CreateContainerHookIf = {
    useCreate: () => {
      const { create, isLoading } = useCreateContainer()
      return {
        create: async (
          containerRequest: ContainerRequest,
        ): Promise<Container> => {
          const result = await create(containerRequest)
          return validateContainer(unwrapMember(result, 'container'))
        },
        isLoading,
      }
    },
  }
  return createContainerIf
}

export default createContainer
