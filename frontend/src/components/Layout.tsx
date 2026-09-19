import type { ReactNode } from 'react'
import type { SearchBeerIf } from './types/beer/types'
import type { SearchBreweryIf } from './types/brewery/types'
import type { NavMenu, NavigateIf, ThemeSelection } from './types/types'
import Nav from './internal/Nav'
import type { LinkComponent } from './common/link'

interface LayoutProps {
  linkComponent: LinkComponent
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
  searchBreweryIf: SearchBreweryIf
  isAdmin: boolean
  isLoggedIn: boolean
  logout: (() => void) | undefined
  navMenu: NavMenu
  theme: ThemeSelection
  children: ReactNode
}

function Layout(props: LayoutProps): React.JSX.Element {
  return (
    <div>
      {props.isLoggedIn && (
        <>
          <header>
            <Nav
              linkComponent={props.linkComponent}
              isAdmin={props.isAdmin}
              logout={props.logout}
              navMenu={props.navMenu}
              navigateIf={props.navigateIf}
              searchBeerIf={props.searchBeerIf}
              searchBreweryIf={props.searchBreweryIf}
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
