import {
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
} from 'react-router'

// The path and query parameters of the current url, offered as interfaces the
// same way navigating is. The shapes are declared here rather than imported
// from types/ so that routing keeps importing nothing; they meet their
// counterparts in RtkApp, which is where drift turns into a compile error.
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
