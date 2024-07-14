import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Outlet } from 'react-router-dom'

import { useSelector } from './react-redux-wrapper'
import { Role } from './store/user/types'
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
import SearchBeerWithNavi from './components/beer/SearchBeerWithNavi'
import SearchBreweryWithNavi from './components/brewery/SearchBreweryWithNavi'
import Stats from './components/stats/Stats'
import Storages from './components/storage/Storages'
import Style from './components/style/Style'
import Styles from './components/style/Styles'
import Users from './components/user/Users'

import {
  useCreateContainerMutation,
  useListContainersQuery,
  useUpdateContainerMutation
} from './store/container/api'
import { useLogoutMutation } from './store/login/api'
import { type Login, selectLogin } from './store/login/reducer'
import { Theme, selectTheme, setTheme } from './store/theme/reducer'
import {
  type Container,
  type ContainerRequest,
  type CreateContainerIf,
  type ListContainersIf,
  type UpdateContainerIf
} from './core/container/types'

interface LayoutProps {
  isAdmin: boolean
  isLoggedIn: boolean
  logout: () => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

function Layout (props: LayoutProps): JSX.Element {
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
                    <Link to="/addreview">Add review</Link>
                  </li>
                )}
                <li>
                  <Link to="/beers">Beers</Link>
                </li>
                <li>
                  <Link to="/breweries">Breweries</Link>
                </li>
                <li>
                  <Link to="/reviews">Reviews</Link>
                </li>
                <li>
                  <Link to="/stats">Statistics</Link>
                </li>
                <li>
                  <Link to="/storage">Storage</Link>
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
                    <SearchBeerWithNavi />
                  </div>
                  <div className='Search'>
                    <SearchBreweryWithNavi />
                  </div>

                  <ul>
                    <li>
                      <Link to="/styles">Styles</Link>
                    </li>
                    <li>
                      <Link to="/containers">Containers</Link>
                    </li>
                    {props.isAdmin && (
                      <li>
                        <Link to="/users">Users</Link>
                      </li>
                    )}
                    <li>
                      <Link to="/account">Account</Link>
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

function App (): JSX.Element {
  const login: Login = useSelector(selectLogin)
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
  const isLoggedIn: boolean = login.authToken?.length > 0
  const [logout] = useLogoutMutation()
  const isAdmin = login?.user?.role === Role.admin

  const [
    createContainer,
    { isLoading: isCreatingContainer }
  ] = useCreateContainerMutation()
  const createContainerIf: CreateContainerIf = {
    create: async (containerRequest: ContainerRequest) => {
      return (await createContainer(containerRequest).unwrap()).container
    },
    isLoading: isCreatingContainer
  }

  const listContainersIf: ListContainersIf = {
    useList: () => {
      const { data, isLoading } = useListContainersQuery()
      return {
        data,
        isLoading
      }
    }
  }

  const [updateContainer, { isLoading: isUpdatingContainer }] =
    useUpdateContainerMutation()
  const updateContainerIf: UpdateContainerIf = {
    update: async (container: Container) => {
      await updateContainer(container)
    },
    isLoading: isUpdatingContainer
  }

  return (
    <div className="App">
      <div className="AppContent">
        <Routes>
          <Route path="/" element={
              <Layout
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
              ? <Beers />
              : <LoginComponent />}
            />
            {isLoggedIn && (
              <React.Fragment>
                {isAdmin && <Route path="addreview" element={
                  <AddReview
                    createContainerIf={createContainerIf}
                    listContainersIf={listContainersIf}
                  />
                } />}
                {isAdmin &&
                  <Route path="addreview/:storageId" element={
                    <AddReview
                      createContainerIf={createContainerIf}
                      listContainersIf={listContainersIf}
                    />
                } />
                }
                <Route path="beers" element={<Beers />} />
                <Route path="beers/:beerId" element={
                  <Beer
                    createContainerIf={createContainerIf}
                    listContainersIf={listContainersIf}
                  />
                } />
                <Route path="breweries" element={<Breweries />} />
                <Route path="breweries/:breweryId" element={
                  <Brewery
                    createContainerIf={createContainerIf}
                    listContainersIf={listContainersIf}
                  />
                } />
                <Route path="containers" element={
                  <Containers
                    listContainersIf={listContainersIf}
                    updateContainerIf={updateContainerIf}
                    />
                } />
                <Route path="reviews" element={
                  <Reviews
                    createContainerIf={createContainerIf}
                    listContainersIf={listContainersIf}
                  />
                } />
                <Route path="styles" element={<Styles />} />
                <Route path="styles/:styleId" element={
                  <Style
                    createContainerIf={createContainerIf}
                    listContainersIf={listContainersIf}
                  />
                } />
                {isAdmin && <Route path="users" element={<Users />} />}
                <Route path="account" element={<Account />} />
                <Route path="stats" element={
                  <Stats breweryId={undefined} styleId={undefined} />
                } />
                <Route path="storage" element={
                  <Storages
                    createContainerIf={createContainerIf}
                    listContainersIf={listContainersIf}
                  />
                } />
              </React.Fragment>
            )}
            <Route
              path="*"
              element={isLoggedIn ? <Beers /> : <LoginComponent />} />
          </Route>
        </Routes>
        <div id='content-end'>&nbsp;</div>
      </div>
    </div>
  )
}

export default App
