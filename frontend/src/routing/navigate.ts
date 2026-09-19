import { useNavigate as useRouterNavigate } from 'react-router'

export type NavigationFunc = (
  url: string,
  options?: { replace: boolean },
) => void | Promise<void>

function useNavigate(): NavigationFunc {
  return useRouterNavigate()
}

export interface NavigateIf {
  useNavigate: () => NavigationFunc
}

export const navigateIf: NavigateIf = {
  useNavigate,
}
