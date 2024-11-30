import type { LoginIf, LoginParams } from "../../core/login/types"
import { useLoginMutation } from "../../store/login/api"

const login: () => LoginIf = () => {
  const loginIf: LoginIf = {
    useLogin: () => {
      const [login, { isLoading }] = useLoginMutation()
      return {
        login: async (loginParams: LoginParams) => {
          await login(loginParams)
        },
        isLoading
      }
    }
  }
  return loginIf
}

export default login
