import type { ReactNode } from "react"
import type { NavigateIf } from "./components/util"
import type { SearchBeerIf } from "./core/beer/types"
import type { SearchBreweryIf } from "./core/brewery/types"
import type { SearchIf } from "./core/search/types"
import type { NavState, Theme } from "./core/types"
import Nav from "./Nav"

export interface NavStateProps {
  navState: NavState
  setNavState: (navState: NavState) => void
}

export interface ThemeProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}

interface LayoutProps {
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
  searchBreweryIf: SearchBreweryIf
  searchIf: SearchIf
  isAdmin: boolean
  isLoggedIn: boolean
  logout: () => void
  navState: NavStateProps
  theme: ThemeProps
  children: ReactNode
}

function Layout (props: LayoutProps): React.JSX.Element {
  return (
    <div>
      {props.isLoggedIn && (
        <>
          <header>
            <Nav
              isAdmin={props.isAdmin}
              logout={props.logout}
              navState={props.navState}
              navigateIf={props.navigateIf}
              searchBeerIf={props.searchBeerIf}
              searchBreweryIf={props.searchBreweryIf}
              searchIf={props.searchIf}
              theme={props.theme}
            />
          </header>
          <hr />
        </>
      )}
      {props.children}
    </div>
  )
}

export default Layout
