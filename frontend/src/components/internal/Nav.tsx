import React from 'react'
import Button from './common/Button'
import SearchBeerWithNavi from './beer/SearchBeerWithNavi'
import SearchBreweryWithNavi from './brewery/SearchBreweryWithNavi'

import type { SearchBeerIf } from '../types/beer/types'
import type { SearchBreweryIf } from '../types/brewery/types'
import type { NavMenu, NavigateIf, ThemeSelection } from '../types/types'
import type { LinkComponent } from '../common/link'

interface Props {
  linkComponent: LinkComponent
  isAdmin: boolean
  logout: (() => void) | undefined
  navMenu: NavMenu
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
  searchBreweryIf: SearchBreweryIf
  theme: ThemeSelection
}

function Nav(props: Props): React.JSX.Element {
  const Link = props.linkComponent
  const isMoreOpen = props.navMenu.navMenuState === 'EXPANDED'
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
              props.navMenu.setNavMenuState(
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
            />
          </div>
          <div className='Search'>
            <SearchBreweryWithNavi
              navigateIf={props.navigateIf}
              searchBreweryIf={props.searchBreweryIf}
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
