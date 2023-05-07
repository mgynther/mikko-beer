import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, Link, Outlet } from 'react-router-dom'

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
import Stats from './components/stats/Stats'
import Styles from './components/style/Styles'
import Users from './components/user/Users'

import { useLogoutMutation } from './store/login/api'
import { type Login, selectLogin } from './store/login/reducer'
import { Theme, selectTheme, setTheme } from './store/theme/reducer'

interface LayoutProps {
  isAdmin: boolean
  isLoggedIn: boolean
  logout: () => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

function Layout (props: LayoutProps): JSX.Element {
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
                  <Link to="/stats">Statistics</Link>
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
                {isAdmin && <Route path="addreview" element={<AddReview />} />}
                <Route path="beers" element={<Beers />} />
                <Route path="beers/:beerId" element={<Beer />} />
                <Route path="breweries" element={<Breweries />} />
                <Route path="breweries/:breweryId" element={<Brewery />} />
                <Route path="containers" element={<Containers />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="styles" element={<Styles />} />
                {isAdmin && <Route path="users" element={<Users />} />}
                <Route path="account" element={<Account />} />
                <Route path="stats" element={<Stats />} />
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
