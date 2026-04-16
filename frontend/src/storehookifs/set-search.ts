import type { NavigateIf } from '../components/util'

type Result = (mode: string, state: Record<string, string>) => Promise<void>

export function createSetSearch(navigateIf: NavigateIf): Result {
  const navigate = navigateIf.useNavigate()
  return async (mode: string, state: Record<string, string>) => {
    const stateParts = Object.keys(state).map((key) => `${key}=${state[key]}`)
    const baseSearch = `?stats=${mode}`
    const allParts = [baseSearch, ...stateParts]
    const newSearch = allParts.join('&')
    await navigate(newSearch, { replace: true })
  }
}
