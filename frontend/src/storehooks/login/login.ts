import type {
  LoginHookIf,
  LoginParams,
  UseLogin,
  UseSaveLogin,
  ValidateLogin,
} from './types'

const login: (
  useLogin: UseLogin,
  useSaveLogin: UseSaveLogin,
  validateLogin: ValidateLogin,
) => LoginHookIf = (useLogin, useSaveLogin, validateLogin) => {
  const loginIf: LoginHookIf = {
    useLogin: () => {
      const { login, isLoading } = useLogin()
      const saveLogin = useSaveLogin()
      return {
        login: async (loginParams: LoginParams): Promise<void> => {
          const result = await login(loginParams)
          // A failed login needs no handling here and must not reject: the
          // component reads the failure from the store. A response that
          // arrives but does not validate is a different matter and does
          // throw.
          if (result.isSuccess) {
            saveLogin(validateLogin(result.data))
          }
        },
        isLoading,
      }
    },
  }
  return loginIf
}

export default login
