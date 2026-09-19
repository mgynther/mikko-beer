import type {
  Container,
  UpdateContainerHookIf,
  UseUpdateContainer,
  ValidateContainer,
} from './types'
import { unwrapMember } from '../envelope'

const updateContainer: (
  useUpdateContainer: UseUpdateContainer,
  validateContainer: ValidateContainer,
) => UpdateContainerHookIf = (useUpdateContainer, validateContainer) => {
  const updateContainerIf: UpdateContainerHookIf = {
    useUpdate: () => {
      const { update, isLoading } = useUpdateContainer()
      return {
        update: async (container: Container): Promise<void> => {
          const result = await update(container)
          validateContainer(unwrapMember(result, 'container'))
        },
        isLoading,
      }
    },
  }
  return updateContainerIf
}

export default updateContainer
