import type {
  CreateUserHookIf,
  CreateUserRequest,
  UseCreateUser,
  ValidateUserOrUndefined,
} from './types'
import { unwrapMemberOrUndefined } from '../envelope'

const createUser: (
  useCreateUser: UseCreateUser,
  validateUserOrUndefined: ValidateUserOrUndefined,
) => CreateUserHookIf = (useCreateUser, validateUserOrUndefined) => {
  const createUserIf: CreateUserHookIf = {
    useCreate: () => {
      const { create, data, hasError, isLoading } = useCreateUser()
      return {
        create: async (user: CreateUserRequest): Promise<void> => {
          await create(user)
        },
        user: validateUserOrUndefined(unwrapMemberOrUndefined(data, 'user')),
        hasError,
        isLoading,
      }
    },
  }
  return createUserIf
}

export default createUser
