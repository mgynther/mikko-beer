import type { RootState } from './store'

interface RefreshDetails {
  userId: string
  refreshToken: string
}

export function parseRefreshDetails(state: unknown): RefreshDetails {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Unknown in the rtk types.
   */
  const rootState = state as RootState | undefined
  const userId: string = rootState?.login.login.user?.id ?? ''
  const refreshToken: string = rootState?.login.login.refreshToken ?? ''
  return {
    userId,
    refreshToken,
  }
}
