import type { LogoutHookIf, UseLogout } from './types'

const logout: (useLogout: UseLogout) => LogoutHookIf = (useLogout) => {
  const logoutIf: LogoutHookIf = {
    useLogout: () => {
      const { logout } = useLogout()
      return {
        logout: async (): Promise<void> => {
          await logout()
        },
      }
    },
  }
  return logoutIf
}

export default logout
