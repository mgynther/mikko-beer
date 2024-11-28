import React, { useState } from 'react'
import Link from './components/common/Link'
import SearchBeerWithNavi from './components/beer/SearchBeerWithNavi'
import SearchBreweryWithNavi from './components/brewery/SearchBreweryWithNavi'

import type { NavigateIf } from './components/util'
import type { SearchBeerIf } from './core/beer/types'
import type { SearchBreweryIf } from './core/brewery/types'
import type { SearchIf } from './core/search/types'
import { Theme } from './core/types'

interface Props {
  isAdmin: boolean
  logout: () => void
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
  searchBreweryIf: SearchBreweryIf
  searchIf: SearchIf
  setTheme: (theme: Theme) => void
  theme: Theme
}

function Nav (props: Props): React.JSX.Element {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  function toggleMore (): void {
    setIsMoreOpen(!isMoreOpen)
  }
  return (
    <nav>
      <ul>
        {props.isAdmin && (
          <li>
            <Link to="/addreview" text="Add review" />
          </li>
        )}
        <li>
          <Link to="/beers" text="Beers" />
        </li>
        <li>
          <Link to="/breweries" text="Breweries" />
        </li>
        <li>
          <Link to="/reviews" text="Reviews" />
        </li>
        <li>
          <Link to="/stats" text="Statistics" />
        </li>
        <li>
          <Link to="/storage" text="Storage" />
        </li>
        <li>
          <button onClick={toggleMore}>
            {isMoreOpen ? 'Less' : 'More'}
          </button>
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
              <Link to="/styles" text="Styles" />
            </li>
            <li>
              <Link to="/containers" text="Containers" />
            </li>
            {props.isAdmin && (
              <li>
                <Link to="/users" text="Users" />
              </li>
            )}
            <li>
              <Link to="/account" text="Account" />
            </li>
            <li>
              <label>
                <input
                  type='checkbox'
                  checked={props.theme === Theme.DARK}
                  onChange={(e) => {
                    props.setTheme(
                      e.target.checked ? Theme.DARK : Theme.LIGHT)
                  }} />
                Dark
                </label>
            </li>
            <li>
              <button onClick={() => { props.logout(); }}>Logout</button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Nav
