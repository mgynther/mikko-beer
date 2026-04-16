import React from 'react'
import Button from './components/common/Button'
import Link from './components/common/Link'
import SearchBeerWithNavi from './components/beer/SearchBeerWithNavi'
import SearchBreweryWithNavi from './components/brewery/SearchBreweryWithNavi'

import type { NavigateIf } from './components/util'
import type { SearchBeerIf } from './core/beer/types'
import type { SearchBreweryIf } from './core/brewery/types'
import type { SearchIf } from './core/search/types'
import type { NavMenuState, Theme } from './core/types'

export interface NavMenuStateProps {
  navMenuState: NavMenuState
  setNavMenuState: (navState: NavMenuState) => void
}

export interface ThemeProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}

interface Props {
  isAdmin: boolean
  logout: (() => void) | undefined
  navMenuState: NavMenuStateProps
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
  searchBreweryIf: SearchBreweryIf
  searchIf: SearchIf
  theme: ThemeProps
}

function Nav(props: Props): React.JSX.Element {
  const isMoreOpen = props.navMenuState.navMenuState === 'EXPANDED'
  const { logout } = props
  return (
    <nav>
      <ul>
        {props.isAdmin && (
          <li>
            <Link to='/addreview' text='Add review' />
          </li>
        )}
        <li>
          <Link to='/beers' text='Beers' />
        </li>
        <li>
          <Link to='/breweries' text='Breweries' />
        </li>
        <li>
          <Link to='/reviews' text='Reviews' />
        </li>
        <li>
          <Link to='/stats' text='Statistics' />
        </li>
        <li>
          <Link to='/storage' text='Storage' />
        </li>
        <li>
          <Button
            onClick={() => {
              props.navMenuState.setNavMenuState(
                isMoreOpen ? 'COLLAPSED' : 'EXPANDED',
              )
            }}
            text={isMoreOpen ? 'Less' : 'More'}
          />
        </li>
      </ul>

      {isMoreOpen && (
        <div>
          <div className='Search'>
            <SearchBeerWithNavi
              navigateIf={props.navigateIf}
              searchBeerIf={props.searchBeerIf}
              searchIf={props.searchIf}
            />
          </div>
          <div className='Search'>
            <SearchBreweryWithNavi
              navigateIf={props.navigateIf}
              searchBreweryIf={props.searchBreweryIf}
              searchIf={props.searchIf}
            />
          </div>

          <ul>
            <li>
              <Link to='/styles' text='Styles' />
            </li>
            <li>
              <Link to='/containers' text='Containers' />
            </li>
            <li>
              <Link to='/locations' text='Locations' />
            </li>
            {props.isAdmin && (
              <li>
                <Link to='/users' text='Users' />
              </li>
            )}
            <li>
              <Link to='/account' text='Account' />
            </li>
            <li>
              <label>
                <input
                  type='checkbox'
                  checked={props.theme.theme === 'DARK'}
                  onChange={(e) => {
                    props.theme.setTheme(e.target.checked ? 'DARK' : 'LIGHT')
                  }}
                />
                Dark
              </label>
            </li>
            <li>
              <Button
                onClick={
                  logout
                    ? (): void => {
                        logout()
                      }
                    : undefined
                }
                text='Logout'
              />
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Nav
