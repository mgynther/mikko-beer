import type { CreateUserIf, CreateUserRequest } from "../../core/user/types"
import { useCreateUserMutation } from "../../store/user/api"
import { validateUserOrUndefined } from "../../validation/user"

const createUser: () => CreateUserIf = () => {
  const createUserIf: CreateUserIf = {
    useCreate: () => {
      const [
        createUser,
        {
          data: createdUserData,
          error: createUserError,
          isLoading: isCreatingUser
        }
      ] = useCreateUserMutation()
      return {
        create: async (user: CreateUserRequest) => {
          await createUser(user)
        },
        user: validateUserOrUndefined(createdUserData?.user),
        hasError: createUserError !== undefined,
        isLoading: isCreatingUser
      }
    }
  }
  return createUserIf
}

export default createUser
