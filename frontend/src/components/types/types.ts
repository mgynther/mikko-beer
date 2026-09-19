export interface Pagination {
  size: number
  skip: number
}

export type NavMenuState = 'COLLAPSED' | 'EXPANDED'

export interface NavMenu {
  navMenuState: NavMenuState
  setNavMenuState: (navMenuState: NavMenuState) => void
}

export interface NavMenuIf {
  useNavMenu: () => NavMenu
}

export type Theme = 'LIGHT' | 'DARK'

export interface ThemeSelection {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export interface ThemeIf {
  useTheme: () => ThemeSelection
}

export type InfiniteScroll = (loadMore: () => void) => () => void

// Navigating is offered to the components as an interface, the same way
// everything else is. The implementation lives in routing/ and defines
// these two on its own rather than importing them from here: a layer that
// imports nothing stays a layer that cannot break. The two definitions meet
// in RtkApp, which is where drift between them turns into a compile error.
export type NavigationFunc = (
  url: string,
  options?: { replace: boolean },
) => void | Promise<void>

export interface NavigateIf {
  useNavigate: () => NavigationFunc
}

export type ListDirection = 'asc' | 'desc'

export type UseDebounce<T> = (value: T, delay?: number) => [T, boolean]

export interface YearMonth {
  year: number
  month: number
}

export interface YearMonthFilter {
  min: YearMonth
  max: YearMonth
  value: YearMonth
  setValue: (yearMonth: YearMonth) => void
}

export interface SearchParameters {
  get: (name: string) => string | undefined
}

export type UseUrlSearchParams = () => SearchParameters

export type UseUrlPathParams = () => Record<string, string | undefined>
