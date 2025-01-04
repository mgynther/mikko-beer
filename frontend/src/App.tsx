import React, { useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router'

import { useSelector } from './react-redux-wrapper'
import {
  Role,
} from './core/user/types'
import { useAppDispatch } from './store/hooks'

import './App.css'

import Account from './components/account/Account'
import AddReview from './components/review/AddReview'
import Beer from './components/beer/Beer'
import Beers from './components/beer/Beers'
import Breweries from './components/brewery/Breweries'
import Brewery from './components/brewery/Brewery'
import Containers from './components/container/Containers'
import LoginComponent from './components/login/Login'
import Reviews from './components/review/Reviews'
import Stats from './components/stats/Stats'
import Storages from './components/storage/Storages'
import Style from './components/style/Style'
import Styles from './components/style/Styles'
import Users from './components/user/Users'

import { selectTheme, setTheme } from './store/theme/reducer'

import { navigateIf } from './components/util'
import type { ParamsIf } from './components/util'
import type { StoreIf } from './store/storeIf'
import ContentEnd from './components/ContentEnd'
import { Theme } from './core/types'
import Layout from './Layout'

interface Props {
  paramsIf: ParamsIf,
  storeIf: StoreIf
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
    getLogin,

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
              >
                <Outlet/>
              </Layout>
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
              <>
                {isAdmin && <Route path="addreview" element={
                  <AddReview
                    createReviewIf={createReviewIf}
                    getStorageIf={getStorageIf}
                    navigateIf={navigateIf}
                    paramsIf={props.paramsIf}
                    searchIf={searchIf}
                  />
                } />}
                {isAdmin &&
                  <Route path="addreview/:storageId" element={
                    <AddReview
                      createReviewIf={createReviewIf}
                      getStorageIf={getStorageIf}
                      navigateIf={navigateIf}
                      paramsIf={props.paramsIf}
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
                    paramsIf={props.paramsIf}
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
                    paramsIf={props.paramsIf}
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
                    paramsIf={props.paramsIf}
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
                    paramsIf={props.paramsIf}
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
              </>
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
