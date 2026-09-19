import type {
  ChangePasswordHookIf,
  ChangePasswordParams,
  GetPasswordChangeResult,
  UseChangePassword,
  UsePasswordChangeResult,
} from './types'

const changePassword: (
  useChangePassword: UseChangePassword,
  usePasswordChangeResult: UsePasswordChangeResult,
) => ChangePasswordHookIf = (useChangePassword, usePasswordChangeResult) => {
  const changePasswordIf: ChangePasswordHookIf = {
    useChangePassword: () => {
      const { changePassword, isLoading } = useChangePassword()
      return {
        changePassword: async (params: ChangePasswordParams): Promise<void> => {
          await changePassword(params)
        },
        isLoading,
      }
    },
    useGetPasswordChangeResult: () => {
      const getPasswordChangeResult: GetPasswordChangeResult = () =>
        usePasswordChangeResult()
      return {
        getResult: getPasswordChangeResult,
      }
    },
  }
  return changePasswordIf
}

export default changePassword
