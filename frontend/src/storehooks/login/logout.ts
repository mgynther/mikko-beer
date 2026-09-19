import type { LogoutHookIf, LogoutParams, UseLogout } from './types'

const logout: (useLogout: UseLogout) => LogoutHookIf = (useLogout) => {
  const logoutIf: LogoutHookIf = {
    useLogout: () => {
      const { logout } = useLogout()
      return {
        logout: async (params: LogoutParams): Promise<void> => {
          await logout(params)
        },
      }
    },
  }
  return logoutIf
}

export default logout
