import type { LogoutIf, LogoutParams } from "../../core/login/types"
import { useLogoutMutation } from "../../store/login/api"

const logout: () => LogoutIf = () => {
  const logoutIf: LogoutIf = {
    useLogout: () => {
      const [logout] = useLogoutMutation()
      return {
        logout: async (params: LogoutParams) => {
          await logout(params)
        }
      }
    }
  }
  return logoutIf
}

export default logout
