import React, { useEffect, useState } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'

import { useSelector } from './react-redux-wrapper'
import {
  Role,
} from './core/user/types'
import { useAppDispatch } from './store/hooks'

import './App.css'

import Account from './components/account/Account'
import Link from './components/common/Link'
import AddReview from './components/review/AddReview'
import Beer from './components/beer/Beer'
import Beers from './components/beer/Beers'
import Breweries from './components/brewery/Breweries'
import Brewery from './components/brewery/Brewery'
import Containers from './components/container/Containers'
import LoginComponent from './components/login/Login'
import Reviews from './components/review/Reviews'
import SearchBeerWithNavi from './components/beer/SearchBeerWithNavi'
import SearchBreweryWithNavi from './components/brewery/SearchBreweryWithNavi'
import Stats from './components/stats/Stats'
import Storages from './components/storage/Storages'
import Style from './components/style/Style'
import Styles from './components/style/Styles'
import Users from './components/user/Users'

import { selectLogin } from './store/login/reducer'
import { Theme, selectTheme, setTheme } from './store/theme/reducer'
import type {
  SearchBreweryIf,
} from './core/brewery/types'

import type {
  GetLogin,
  Login,
} from './core/login/types'
import type {
  SearchBeerIf,
} from './core/beer/types'
import type { SearchIf } from './core/search/types'
import {
  type NavigateIf,
  navigateIf,
  paramsIf,
} from './components/util'
import type { StoreIf } from './store/storeIf'
import ContentEnd from './components/ContentEnd'

interface Props {
  storeIf: StoreIf
}

interface LayoutProps {
  navigateIf: NavigateIf
  searchBeerIf: SearchBeerIf
  searchBreweryIf: SearchBreweryIf
  searchIf: SearchIf
  isAdmin: boolean
  isLoggedIn: boolean
  logout: () => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

function Layout (props: LayoutProps): React.JSX.Element {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  function toggleMore (): void {
    setIsMoreOpen(!isMoreOpen)
  }
  return (
    <div>
      {props.isLoggedIn && (
        <React.Fragment>
          <header>
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
                      <button onClick={props.logout}>Logout</button>
                    </li>
                  </ul>
                </div>
              )}
            </nav>
          </header>
          <hr />
        </React.Fragment>
      )}
      <Outlet />
    </div>
  )
}

function App (props: Props): React.JSX.Element {
  const theme: Theme = useSelector(selectTheme)
  useEffect(() => {
    const bodyElements = document.getElementsByTagName('body')
    if (theme === Theme.DARK) {
      bodyElements[0].removeAttribute('class')
    } else {
      bodyElements[0].setAttribute('class', 'light')
    }
  }, [theme])
  const dispatch = useAppDispatch()

  const {
    getBeerIf,
    listBeersIf,
    searchBeerIf,
    selectBeerIf,
    updateBeerIf,

    getBreweryIf,
    listBreweriesIf,
    searchBreweryIf,
    updateBreweryIf,

    listContainersIf,
    reviewContainerIf,
    updateContainerIf,

    changePasswordIf,
    loginIf,
    logoutIf,

    createReviewIf,
    listReviewsIf,
    listReviewsByBeerIf,
    listReviewsByBreweryIf,
    listReviewsByStyleIf,
    reviewIf,

    statsIf,

    searchIf,

    createStorageIf,
    getStorageIf,
    listStoragesIf,
    listStoragesByBeerIf,
    listStoragesByBreweryIf,
    listStoragesByStyleIf,

    getStyleIf,
    listStylesIf,
    updateStyleIf,

    userIf,

  } = props.storeIf

  const getLogin: GetLogin = () => {
    const login: Login = useSelector(selectLogin)
    return login
  }
  const login = getLogin()
  const isLoggedIn: boolean = login.authToken.length > 0
  const isAdmin = login.user?.role === Role.admin

  const { logout } = logoutIf.useLogout()

  return (
    <div className="App">
      <div className="AppContent">
        <Routes>
          <Route path="/" element={
              <Layout
                navigateIf={navigateIf}
                searchBeerIf={searchBeerIf}
                searchBreweryIf={searchBreweryIf}
                searchIf={searchIf}
                isAdmin={isAdmin}
                isLoggedIn={isLoggedIn}
                logout={() => {
                  void logout({
                    userId: login.user?.id ?? '',
                    body: {
                      refreshToken: login.refreshToken
                    }
                  })
                }}
                theme={theme}
                setTheme={(theme: Theme) => {
                  dispatch(setTheme(theme))
                }}
              />
            }>
            <Route index element={isLoggedIn
              ? <Beers
                  listBeersIf={listBeersIf}
                  navigateIf={navigateIf}
                  searchBeerIf={searchBeerIf}
                  searchIf={searchIf}
                />
              : <LoginComponent loginIf={loginIf} />}
            />
            {isLoggedIn && (
              <React.Fragment>
                {isAdmin && <Route path="addreview" element={
                  <AddReview
                    createReviewIf={createReviewIf}
                    getStorageIf={getStorageIf}
                    navigateIf={navigateIf}
                    paramsIf={paramsIf}
                    searchIf={searchIf}
                  />
                } />}
                {isAdmin &&
                  <Route path="addreview/:storageId" element={
                    <AddReview
                      createReviewIf={createReviewIf}
                      getStorageIf={getStorageIf}
                      navigateIf={navigateIf}
                      paramsIf={paramsIf}
                      searchIf={searchIf}
                    />
                } />
                }
                <Route path="beers" element={
                  <Beers
                    listBeersIf={listBeersIf}
                    navigateIf={navigateIf}
                    searchBeerIf={searchBeerIf}
                    searchIf={searchIf}
                  />
                } />
                <Route path="beers/:beerId" element={
                  <Beer
                    getBeerIf={getBeerIf}
                    listReviewsByBeerIf={listReviewsByBeerIf}
                    listStoragesByBeerIf={listStoragesByBeerIf}
                    paramsIf={paramsIf}
                    reviewIf={reviewIf}
                    searchIf={searchIf}
                    updateBeerIf={updateBeerIf}
                  />
                } />
                <Route path="breweries" element={
                  <Breweries
                    listBreweriesIf={listBreweriesIf}
                    navigateIf={navigateIf}
                    searchBreweryIf={searchBreweryIf}
                    searchIf={searchIf}
                  />
                } />
                <Route path="breweries/:breweryId" element={
                  <Brewery
                    getBreweryIf={getBreweryIf}
                    listReviewsByBreweryIf={listReviewsByBreweryIf}
                    listStoragesByBreweryIf={listStoragesByBreweryIf}
                    paramsIf={paramsIf}
                    reviewIf={reviewIf}
                    searchIf={searchIf}
                    statsIf={statsIf}
                    updateBreweryIf={updateBreweryIf}
                  />
                } />
                <Route path="containers" element={
                  <Containers
                    getLogin={getLogin}
                    listContainersIf={listContainersIf}
                    updateContainerIf={updateContainerIf}
                    />
                } />
                <Route path="reviews" element={
                  <Reviews
                    listReviewsIf={listReviewsIf}
                    reviewIf={reviewIf}
                    searchIf={searchIf}
                  />
                } />
                <Route path="styles" element={
                  <Styles
                    listStylesIf={listStylesIf}
                    navigateIf={navigateIf}
                    searchIf={searchIf}
                  />
                } />
                <Route path="styles/:styleId" element={
                  <Style
                    listReviewsByStyleIf={listReviewsByStyleIf}
                    listStoragesByStyleIf={listStoragesByStyleIf}
                    paramsIf={paramsIf}
                    reviewIf={reviewIf}
                    getStyleIf={getStyleIf}
                    statsIf={statsIf}
                    searchIf={searchIf}
                    updateStyleIf={updateStyleIf}
                  />
                } />
                {isAdmin && <Route path="users" element={
                  <Users userIf={userIf}/>} />
                }
                <Route path="account" element={
                  <Account
                    changePasswordIf={changePasswordIf}
                    getLogin={getLogin}
                  />
                } />
                <Route path="stats" element={
                  <Stats
                    statsIf={statsIf}
                    breweryId={undefined}
                    styleId={undefined}
                  />
                } />
                <Route path="storage" element={
                  <Storages
                    getLogin={getLogin}
                    listStoragesIf={listStoragesIf}
                    reviewContainerIf={reviewContainerIf}
                    searchIf={searchIf}
                    selectBeerIf={selectBeerIf}
                    createStorageIf={createStorageIf}
                  />
                } />
              </React.Fragment>
            )}
            <Route
              path="*"
              element={isLoggedIn
                ? <Beers
                    listBeersIf={listBeersIf}
                    navigateIf={navigateIf}
                    searchBeerIf={searchBeerIf}
                    searchIf={searchIf}
                  />
                : <LoginComponent loginIf={loginIf}/>} />
          </Route>
        </Routes>
        <ContentEnd/>
      </div>
    </div>
  )
}

export default App
