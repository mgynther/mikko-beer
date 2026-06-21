import React, { useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router'

import { useSelector } from './react-redux-wrapper'
import { Role } from './core/user/types'
import type { User } from './core/user/types'
import { useAppDispatch } from './store/hooks'

import './App.css'

import Account from './components/account/Account'
import AddReview from './components/review/AddReview'
import Beer from './components/beer/Beer'
import Beers from './components/beer/Beers'
import Breweries from './components/brewery/Breweries'
import Brewery from './components/brewery/Brewery'
import Containers from './components/container/Containers'
import Locations from './components/location/Locations'
import Location from './components/location/Location'
import LoginComponent from './components/login/Login'
import Reviews from './components/review/Reviews'
import Stats from './components/stats/Stats'
import Storages from './components/storage/Storages'
import Style from './components/style/Style'
import Styles from './components/style/Styles'
import Users from './components/user/Users'

import { selectState, setState } from './store/nav-menu/reducer'
import { selectTheme, setTheme } from './store/theme/reducer'

import { navigateIf } from './navigation'
import type { UseUrlPathParams } from './components/util'
import type { StoreIf } from './store/storeIf'
import ContentEnd from './components/ContentEnd'
import type { NavMenuState, Theme } from './core/types'
import Layout from './Layout'
import { applyTheme } from './theme-applier'

interface Props {
  storeIf: StoreIf
  useUrlPathParams: UseUrlPathParams
}

function App(props: Props): React.JSX.Element {
  const navState: NavMenuState = useSelector(selectState)
  const theme: Theme = useSelector(selectTheme)
  useEffect(() => {
    applyTheme(theme)
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

    getLocationIf,
    listLocationsIf,
    searchLocationIf,
    updateLocationIf,

    changePasswordIf,
    loginIf,
    logoutIf,

    createReviewIf,
    listReviewsIf,
    listReviewsByBeerIf,
    listReviewsByBreweryIf,
    listReviewsByLocationIf,
    listReviewsByStyleIf,
    reviewIf,

    statsIf,

    searchFieldIf,

    createStorageIf,
    getStorageIf,
    listStoragesIf,
    listStoragesByBeerIf,
    listStoragesByBreweryIf,
    listStoragesByStyleIf,
    storageStatsIf,

    getStyleIf,
    listStylesIf,
    updateStyleIf,

    userIf,
  } = props.storeIf

  const login = getLogin()
  const isLoggedIn: boolean = login.authToken.length > 0
  const isAdmin = login.user?.role === Role.admin

  const { logout } = logoutIf.useLogout()

  function doLogout(user: User): void {
    void logout({
      userId: user.id,
      body: {
        refreshToken: login.refreshToken,
      },
    })
  }
  const user: User | undefined = login.user

  return (
    <div className='App'>
      <div className='AppContent'>
        <Routes>
          <Route
            path='/'
            element={
              <Layout
                navigateIf={navigateIf}
                searchBeerIf={searchBeerIf}
                searchBreweryIf={searchBreweryIf}
                isAdmin={isAdmin}
                isLoggedIn={isLoggedIn}
                logout={
                  user
                    ? (): void => {
                        doLogout(user)
                      }
                    : undefined
                }
                navMenuState={{
                  navMenuState: navState,
                  setNavMenuState: (navMenuState: NavMenuState) => {
                    dispatch(setState(navMenuState))
                  },
                }}
                theme={{
                  theme,
                  setTheme: (theme: Theme) => {
                    dispatch(setTheme(theme))
                  },
                }}
              >
                <Outlet />
              </Layout>
            }
          >
            <Route
              index
              element={
                isLoggedIn ? (
                  <Beers
                    listBeersIf={listBeersIf}
                    navigateIf={navigateIf}
                    searchBeerIf={searchBeerIf}
                    searchFieldIf={searchFieldIf}
                  />
                ) : (
                  <LoginComponent loginIf={loginIf} />
                )
              }
            />
            {isLoggedIn && (
              <>
                {isAdmin && (
                  <Route
                    path='addreview'
                    element={
                      <AddReview
                        createReviewIf={createReviewIf}
                        getStorageIf={getStorageIf}
                        navigateIf={navigateIf}
                        useUrlPathParams={props.useUrlPathParams}
                      />
                    }
                  />
                )}
                {isAdmin && (
                  <Route
                    path='addreview/:storageId'
                    element={
                      <AddReview
                        createReviewIf={createReviewIf}
                        getStorageIf={getStorageIf}
                        navigateIf={navigateIf}
                        useUrlPathParams={props.useUrlPathParams}
                      />
                    }
                  />
                )}
                <Route
                  path='beers'
                  element={
                    <Beers
                      listBeersIf={listBeersIf}
                      navigateIf={navigateIf}
                      searchBeerIf={searchBeerIf}
                      searchFieldIf={searchFieldIf}
                    />
                  }
                />
                <Route
                  path='beers/:beerId'
                  element={
                    <Beer
                      getBeerIf={getBeerIf}
                      listReviewsByBeerIf={listReviewsByBeerIf}
                      listStoragesByBeerIf={listStoragesByBeerIf}
                      updateBeerIf={updateBeerIf}
                      useUrlPathParams={props.useUrlPathParams}
                    />
                  }
                />
                <Route
                  path='breweries'
                  element={
                    <Breweries
                      listBreweriesIf={listBreweriesIf}
                      navigateIf={navigateIf}
                      searchBreweryIf={searchBreweryIf}
                    />
                  }
                />
                <Route
                  path='breweries/:breweryId'
                  element={
                    <Brewery
                      getBreweryIf={getBreweryIf}
                      listReviewsByBreweryIf={listReviewsByBreweryIf}
                      listStoragesByBreweryIf={listStoragesByBreweryIf}
                      statsIf={statsIf}
                      updateBreweryIf={updateBreweryIf}
                      useUrlPathParams={props.useUrlPathParams}
                    />
                  }
                />
                <Route
                  path='containers'
                  element={
                    <Containers
                      listContainersIf={listContainersIf}
                      updateContainerIf={updateContainerIf}
                    />
                  }
                />
                <Route
                  path='locations'
                  element={
                    <Locations
                      listLocationsIf={listLocationsIf}
                      navigateIf={navigateIf}
                      searchLocationIf={searchLocationIf}
                    />
                  }
                />
                <Route
                  path='locations/:locationId'
                  element={
                    <Location
                      getLocationIf={getLocationIf}
                      listReviewsByLocationIf={listReviewsByLocationIf}
                      statsIf={statsIf}
                      updateLocationIf={updateLocationIf}
                      useUrlPathParams={props.useUrlPathParams}
                    />
                  }
                />
                <Route
                  path='reviews'
                  element={
                    <Reviews
                      listReviewsIf={listReviewsIf}
                      reviewIf={reviewIf}
                    />
                  }
                />
                <Route
                  path='styles'
                  element={
                    <Styles
                      listStylesIf={listStylesIf}
                      navigateIf={navigateIf}
                    />
                  }
                />
                <Route
                  path='styles/:styleId'
                  element={
                    <Style
                      listReviewsByStyleIf={listReviewsByStyleIf}
                      listStoragesByStyleIf={listStoragesByStyleIf}
                      getStyleIf={getStyleIf}
                      statsIf={statsIf}
                      updateStyleIf={updateStyleIf}
                      useUrlPathParams={props.useUrlPathParams}
                    />
                  }
                />
                {isAdmin && (
                  <Route path='users' element={<Users userIf={userIf} />} />
                )}
                <Route
                  path='account'
                  element={
                    <Account
                      changePasswordIf={changePasswordIf}
                      getLogin={getLogin}
                    />
                  }
                />
                <Route
                  path='stats'
                  element={
                    <Stats
                      statsIf={statsIf}
                      breweryId={undefined}
                      locationId={undefined}
                      styleId={undefined}
                    />
                  }
                />
                <Route
                  path='storage'
                  element={
                    <Storages
                      getLogin={getLogin}
                      listStoragesIf={listStoragesIf}
                      reviewContainerIf={reviewContainerIf}
                      selectBeerIf={selectBeerIf}
                      statsIf={storageStatsIf}
                      createStorageIf={createStorageIf}
                    />
                  }
                />
              </>
            )}
            <Route
              path='*'
              element={
                isLoggedIn ? (
                  <Beers
                    listBeersIf={listBeersIf}
                    navigateIf={navigateIf}
                    searchBeerIf={searchBeerIf}
                    searchFieldIf={searchFieldIf}
                  />
                ) : (
                  <LoginComponent loginIf={loginIf} />
                )
              }
            />
          </Route>
        </Routes>
        <ContentEnd />
      </div>
    </div>
  )
}

export default App
