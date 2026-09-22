import { useNavigate as useRouterNavigate } from 'react-router'

export type NavigationFunc = (
  url: string,
  options?: { replace: boolean },
) => Promise<void>

// react-router's own navigate answers void | Promise<void>, which leaves
// every caller unable to say whether there is a rejection to handle. The
// interface this layer offers promises one, so the callers have one thing to
// do with it.
function useNavigate(): NavigationFunc {
  const navigate = useRouterNavigate()
  return async (url, options) => {
    await navigate(url, options)
  }
}

export interface NavigateIf {
  useNavigate: () => NavigationFunc
}

export const navigateIf: NavigateIf = {
  useNavigate,
}
