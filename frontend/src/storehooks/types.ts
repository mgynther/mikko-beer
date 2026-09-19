// The shapes more than one domain of this layer works on, declared here
// rather than imported from types/. See the comment in
// storehooks/style/types.ts.
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

export interface SearchFieldHookIf {
  useSearchField: () => {
    activate: () => void
    isActive: boolean
  }
}
