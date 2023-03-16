import React from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, Link, Outlet } from 'react-router-dom'

import './App.css'

import Beers from './components/Beers'
import Breweries from './components/Breweries'
import Containers from './components/Containers'
import Login from './components/Login'
import Reviews from './components/Reviews'
import Styles from './components/Styles'
import Users from './components/Users'

import { useLogoutMutation } from './store/login/api'
import { type LoginState, selectLogin } from './store/login/reducer'

interface LayoutProps {
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
                <li>
                  <Link to="/users">Users</Link>
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
  const loginState: LoginState = useSelector(selectLogin)
  const isLoggedIn: boolean = loginState.authToken?.length > 0
  const [logout] = useLogoutMutation()
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
            <Layout
              isLoggedIn={isLoggedIn}
              logout={() => {
                void logout({
                  userId: loginState.user?.id ?? '',
                  body: {
                    refreshToken: loginState.refreshToken
                  }
                })
              }}
            />
          }>
          <Route index element={isLoggedIn ? <Beers /> : <Login />} />
          {isLoggedIn && (
            <React.Fragment>
              <Route path="beers" element={<Beers />} />
              <Route path="breweries" element={<Breweries />} />
              <Route path="containers" element={<Containers />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="styles" element={<Styles />} />
              <Route path="users" element={<Users />} />
            </React.Fragment>
          )}
          <Route path="*" element={isLoggedIn ? <Beers /> : <Login />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
