import React from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, Link, Outlet } from 'react-router-dom'

import { Role } from './store/user/types'

import './App.css'

import Account from './components/Account'
import AddReview from './components/AddReview'
import Beers from './components/Beers'
import Breweries from './components/Breweries'
import Brewery from './components/Brewery'
import Containers from './components/Containers'
import LoginComponent from './components/Login'
import Reviews from './components/Reviews'
import Styles from './components/Styles'
import Users from './components/Users'

import { useLogoutMutation } from './store/login/api'
import { type Login, selectLogin } from './store/login/reducer'

interface LayoutProps {
  isAdmin: boolean
  isLoggedIn: boolean
  logout: () => void
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
                <Route path="breweries" element={<Breweries />} />
                <Route path="breweries/:breweryId" element={<Brewery />} />
                <Route path="containers" element={<Containers />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="styles" element={<Styles />} />
                {isAdmin && <Route path="users" element={<Users />} />}
                <Route path="account" element={<Account />} />
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
