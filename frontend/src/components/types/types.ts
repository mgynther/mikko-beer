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

export type NavigationFunc = (
  url: string,
  options?: { replace: boolean },
) => Promise<void>

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
