import {
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
} from 'react-router'

export type UseUrlPathParams = () => Record<string, string | undefined>

export interface SearchParameters {
  get: (name: string) => string | undefined
}

export type UseUrlSearchParams = () => SearchParameters

export const useUrlPathParams: UseUrlPathParams = () => {
  return useRouterParams()
}

export const useUrlSearchParams: UseUrlSearchParams = () => {
  const searchParams = useRouterSearchParams()[0]
  return {
    get: (name: string): string | undefined =>
      searchParams.get(name) ?? undefined,
  }
}
