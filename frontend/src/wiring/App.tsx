import React, { useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router'

import { Role } from '../components/types/user/types'
import type { User } from '../components/types/user/types'

import './App.css'

import Account from '../components/account/Account'
import AddReview from '../components/review/AddReview'
import Beer from '../components/beer/Beer'
import Beers from '../components/beer/Beers'
import Breweries from '../components/brewery/Breweries'
import Brewery from '../components/brewery/Brewery'
import Containers from '../components/container/Containers'
import Locations from '../components/location/Locations'
import Location from '../components/location/Location'
import LoginComponent from '../components/login/Login'
import Reviews from '../components/review/Reviews'
import Stats from '../components/stats/Stats'
import Storages from '../components/storage/Storages'
import Style from '../components/style/Style'
import Styles from '../components/style/Styles'
import Users from '../components/user/Users'

import type { StoreIf } from '../components/types/storeIf'
import ContentEnd from '../components/ContentEnd'
import type { NavigateIf, UseUrlPathParams } from '../components/types/types'
import Layout from '../components/Layout'
import { applyTheme } from './theme-applier'
import type { LinkComponent } from '../components/common/link'

interface Props {
  linkComponent: LinkComponent
  navigateIf: NavigateIf
  storeIf: StoreIf
  useUrlPathParams: UseUrlPathParams
}

function App(props: Props): React.JSX.Element {
  const navMenu = props.storeIf.navMenuIf.useNavMenu()
  const themeSelection = props.storeIf.themeIf.useTheme()
  const { theme } = themeSelection
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const {
    getLogin,

    getBeerIf,
    listBeersIf,
    searchBeerIf,
    selectBeerIf,
    updateBeerLoginIf,

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
                linkComponent={props.linkComponent}
                navigateIf={props.navigateIf}
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
                navMenu={navMenu}
                theme={themeSelection}
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
                    linkComponent={props.linkComponent}
                    listBeersIf={listBeersIf}
                    navigateIf={props.navigateIf}
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
                        navigateIf={props.navigateIf}
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
                        navigateIf={props.navigateIf}
                        useUrlPathParams={props.useUrlPathParams}
                      />
                    }
                  />
                )}
                <Route
                  path='beers'
                  element={
                    <Beers
                      linkComponent={props.linkComponent}
                      listBeersIf={listBeersIf}
                      navigateIf={props.navigateIf}
                      searchBeerIf={searchBeerIf}
                      searchFieldIf={searchFieldIf}
                    />
                  }
                />
                <Route
                  path='beers/:beerId'
                  element={
                    <Beer
                      linkComponent={props.linkComponent}
                      getBeerIf={getBeerIf}
                      listReviewsByBeerIf={listReviewsByBeerIf}
                      listStoragesByBeerIf={listStoragesByBeerIf}
                      updateBeerLoginIf={updateBeerLoginIf}
                      useUrlPathParams={props.useUrlPathParams}
                    />
                  }
                />
                <Route
                  path='breweries'
                  element={
                    <Breweries
                      linkComponent={props.linkComponent}
                      listBreweriesIf={listBreweriesIf}
                      navigateIf={props.navigateIf}
                      searchBreweryIf={searchBreweryIf}
                    />
                  }
                />
                <Route
                  path='breweries/:breweryId'
                  element={
                    <Brewery
                      linkComponent={props.linkComponent}
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
                      linkComponent={props.linkComponent}
                      listLocationsIf={listLocationsIf}
                      navigateIf={props.navigateIf}
                      searchLocationIf={searchLocationIf}
                    />
                  }
                />
                <Route
                  path='locations/:locationId'
                  element={
                    <Location
                      linkComponent={props.linkComponent}
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
                      linkComponent={props.linkComponent}
                      listReviewsIf={listReviewsIf}
                      reviewIf={reviewIf}
                    />
                  }
                />
                <Route
                  path='styles'
                  element={
                    <Styles
                      linkComponent={props.linkComponent}
                      listStylesIf={listStylesIf}
                      navigateIf={props.navigateIf}
                    />
                  }
                />
                <Route
                  path='styles/:styleId'
                  element={
                    <Style
                      linkComponent={props.linkComponent}
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
                      linkComponent={props.linkComponent}
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
                      linkComponent={props.linkComponent}
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
                    linkComponent={props.linkComponent}
                    listBeersIf={listBeersIf}
                    navigateIf={props.navigateIf}
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
