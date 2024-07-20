import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Outlet } from 'react-router-dom'

import { useSelector } from './react-redux-wrapper'
import {
  Role,
  type CreateUserRequest,
  type UserIf
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
import {
  useChangePasswordMutation,
  useLoginMutation,
  useLogoutMutation
} from './store/login/api'
import { selectLogin, selectPasswordChangeResult } from './store/login/reducer'
import { Theme, selectTheme, setTheme } from './store/theme/reducer'
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useListUsersQuery
} from './store/user/api'
import type {
  Brewery as BreweryType,
  SelectBreweryIf,
  CreateBreweryIf,
  CreateBreweryRequest,
  SearchBreweryIf,
  UpdateBreweryIf
} from './core/brewery/types'
import type {
  Container,
  ContainerRequest,
  CreateContainerIf,
  ListContainersIf,
  UpdateContainerIf
} from './core/container/types'

import {
  type ReviewContainerIf
} from './core/review/types'
import {
  useCreateStyleMutation,
  useGetStyleQuery,
  useListStylesQuery,
  useUpdateStyleMutation
} from './store/style/api'
import type {
  CreateStyleIf,
  CreateStyleRequest,
  GetStyleIf,
  ListStylesIf,
  SelectStyleIf,
  StyleWithParentIds,
  UpdateStyleIf
} from './core/style/types'
import type {
  ChangePasswordIf,
  ChangePasswordParams,
  GetLogin,
  GetPasswordChangeResult,
  Login,
  LoginIf,
  LoginParams,
  PasswordChangeResult
} from './core/login/types'
import type {
  BeerWithIds,
  CreateBeerIf,
  CreateBeerRequest,
  EditBeerIf,
  GetBeerIf,
  UpdateBeerIf
} from './core/beer/types'
import {
  useCreateBeerMutation,
  useGetBeerQuery,
  useUpdateBeerMutation
} from './store/beer/api'
import {
  useCreateBreweryMutation,
  useLazySearchBreweriesQuery,
  useUpdateBreweryMutation
} from './store/brewery/api'
import type {
  CreateStorageIf,
  CreateStorageRequest
} from './core/storage/types'
import { useCreateStorageMutation } from './store/storage/api'

interface LayoutProps {
  searchBreweryIf: SearchBreweryIf
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
                    <SearchBreweryWithNavi
                      searchBreweryIf={props.searchBreweryIf}
                    />
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
  const [logout] = useLogoutMutation()

  const getBeerIf: GetBeerIf = {
    useGetBeer: (beerId: string) => {
      const { data, isLoading } = useGetBeerQuery(beerId)
      return {
        beer: data?.beer,
        isLoading
      }
    }
  }

  const createBreweryIf: CreateBreweryIf = {
    useCreate: () => {
      const [
        createBrewery,
        { isLoading }
      ] = useCreateBreweryMutation()
      return {
        create: async (
          breweryRequest: CreateBreweryRequest
        ): Promise<BreweryType> => {
          const result = await createBrewery(breweryRequest).unwrap()
          return result.brewery
        },
        isLoading
      }
    }
  }

  const updateBreweryIf: UpdateBreweryIf = {
    useUpdate: () => {
      const [
        updateBrewery,
        { isLoading }
      ] = useUpdateBreweryMutation()
      return {
        update: async (
          breweryRequest: BreweryType
        ): Promise<void> => {
          await updateBrewery(breweryRequest)
        },
        isLoading
      }
    }
  }

  const searchBreweryIf: SearchBreweryIf = {
    useSearch: () => {
      const [
        searchBrewery,
        { isLoading }
      ] = useLazySearchBreweriesQuery()
      return {
        search: async (name: string) => {
          const result = await searchBrewery(name).unwrap()
          return result.breweries
        },
        isLoading
      }
    }
  }

  const selectBreweryIf: SelectBreweryIf = {
    create: createBreweryIf,
    search: searchBreweryIf
  }

  const createContainerIf: CreateContainerIf = {
    useCreate: () => {
      const [
        createContainer,
        { isLoading: isCreatingContainer }
      ] = useCreateContainerMutation()
      return {
        create: async (containerRequest: ContainerRequest) => {
          return (await createContainer(containerRequest).unwrap()).container
        },
        isLoading: isCreatingContainer
      }
    }
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

  const updateContainerIf: UpdateContainerIf = {
    useUpdate: () => {
      const [updateContainer, { isLoading: isUpdatingContainer }] =
        useUpdateContainerMutation()
      return {
        update: async (container: Container) => {
          await updateContainer(container)
        },
        isLoading: isUpdatingContainer
      }
    }
  }

  const reviewContainerIf: ReviewContainerIf = {
    createIf: createContainerIf,
    listIf: listContainersIf
  }

  const userIf: UserIf = {
    create: {
      useCreate: () => {
        const [
          createUser,
          {
            data: createdUserData,
            error: createUserError,
            isLoading: isCreatingUser
          }
        ] = useCreateUserMutation()
        return {
          create: async (user: CreateUserRequest) => {
            await createUser(user)
          },
          user: createdUserData?.user,
          hasError: createUserError !== undefined,
          isLoading: isCreatingUser
        }
      }
    },
    delete: {
      useDelete: () => {
        const [deleteUser] = useDeleteUserMutation()
        return {
          delete: async (userId: string) => {
            await deleteUser(userId)
          }
        }
      }
    },
    list: {
      useList: () => {
        const { data, isLoading } = useListUsersQuery()
        return {
          data,
          isLoading
        }
      }
    }
  }

  const createStyleIf: CreateStyleIf = {
    useCreate: () => {
      const [
        createStyle,
        { data, isError, isLoading, isSuccess }
      ] = useCreateStyleMutation()
      return {
        create: async (style: CreateStyleRequest) => {
          await createStyle(style)
        },
        createdStyle: data?.style,
        hasError: isError,
        isLoading,
        isSuccess
      }
    }
  }

  const getStyleIf: GetStyleIf = {
    useGet: (styleId: string) => {
      const { data, isLoading } = useGetStyleQuery(styleId)
      return {
        style: data?.style,
        isLoading
      }
    }
  }

  const listStylesIf: ListStylesIf = {
    useList: () => {
      const { data, isLoading } = useListStylesQuery()
      return {
        styles: data?.styles,
        isLoading
      }
    }
  }

  const selectStyleIf: SelectStyleIf = {
    create: createStyleIf,
    list: listStylesIf
  }

  const editBeerIf: EditBeerIf = {
    selectBreweryIf,
    selectStyleIf
  }

  const createBeerIf: CreateBeerIf = {
    useCreate: () => {
      const [
        createBeer,
        { isLoading }
      ] = useCreateBeerMutation()
      return {
        create: async (
          beerRequest: CreateBeerRequest
        ): Promise<BeerWithIds> => {
          const result = await createBeer({
            ...beerRequest
          }).unwrap()
          return result.beer
        },
        isLoading
      }
    },
    editBeerIf
  }

  const updateBeerIf: UpdateBeerIf = {
    useUpdate: () => {
      const [updateBeer, { isLoading }] =
        useUpdateBeerMutation()
      return {
        update: async (beer: BeerWithIds): Promise<void> => {
          await updateBeer({ ...beer })
        },
        isLoading
      }
    },
    editBeerIf
  }

  const updateStyleIf: UpdateStyleIf = {
    useUpdate: () => {
      const [
        updateStyle,
        { isError, isLoading, isSuccess }
      ] = useUpdateStyleMutation()
      return {
        update: async (style: StyleWithParentIds) => {
          await updateStyle(style)
        },
        hasError: isError,
        isLoading,
        isSuccess
      }
    }
  }

  const loginIf: LoginIf = {
    useLogin: () => {
      const [login, { isLoading }] = useLoginMutation()
      return {
        login: async (loginParams: LoginParams) => {
          await login(loginParams)
        },
        isLoading
      }
    }
  }

  const getLogin: GetLogin = () => {
    const login: Login = useSelector(selectLogin)
    return login
  }
  const login = getLogin()
  const isLoggedIn: boolean = login.authToken?.length > 0
  const isAdmin = login?.user?.role === Role.admin

  const changePasswordIf: ChangePasswordIf = {
    useChangePassword: () => {
      const [changePassword, { isLoading }] = useChangePasswordMutation()
      return {
        changePassword: async (params: ChangePasswordParams) => {
          await changePassword(params)
        },
        isLoading,
      }
    },
    useGetPasswordChangeResult: () => {
      const getPasswordChangeResult: GetPasswordChangeResult = () => {
        const passwordChangeResult: PasswordChangeResult =
          useSelector(selectPasswordChangeResult)
        return passwordChangeResult
      }
      return {
        getResult: getPasswordChangeResult
      }
    }
  }

  const createStorageIf: CreateStorageIf = {
    useCreate: () => {
      const [createStorage, { error, isLoading }] =
        useCreateStorageMutation()
      return {
        create: async (request: CreateStorageRequest) => {
          await createStorage(request)
        },
        hasError: error !== undefined,
        isLoading
      }
    }
  }

  return (
    <div className="App">
      <div className="AppContent">
        <Routes>
          <Route path="/" element={
              <Layout
                searchBreweryIf={searchBreweryIf}
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
              : <LoginComponent loginIf={loginIf} />}
            />
            {isLoggedIn && (
              <React.Fragment>
                {isAdmin && <Route path="addreview" element={
                  <AddReview
                    reviewContainerIf={reviewContainerIf}
                    createBeerIf={createBeerIf}
                  />
                } />}
                {isAdmin &&
                  <Route path="addreview/:storageId" element={
                    <AddReview
                      reviewContainerIf={reviewContainerIf}
                      createBeerIf={createBeerIf}
                    />
                } />
                }
                <Route path="beers" element={<Beers />} />
                <Route path="beers/:beerId" element={
                  <Beer
                    getBeerIf={getBeerIf}
                    getLogin={getLogin}
                    reviewContainerIf={reviewContainerIf}
                    createBeerIf={createBeerIf}
                    updateBeerIf={updateBeerIf}
                  />
                } />
                <Route path="breweries" element={
                  <Breweries
                    searchBreweryIf={searchBreweryIf}
                  />
                } />
                <Route path="breweries/:breweryId" element={
                  <Brewery
                    getLogin={getLogin}
                    reviewContainerIf={reviewContainerIf}
                    createBeerIf={createBeerIf}
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
                    getLogin={getLogin}
                    reviewContainerIf={reviewContainerIf}
                    createBeerIf={createBeerIf}
                  />
                } />
                <Route path="styles" element={
                  <Styles listStylesIf={listStylesIf} />
                } />
                <Route path="styles/:styleId" element={
                  <Style
                    getLogin={getLogin}
                    getStyleIf={getStyleIf}
                    reviewContainerIf={reviewContainerIf}
                    createBeerIf={createBeerIf}
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
                  <Stats breweryId={undefined} styleId={undefined} />
                } />
                <Route path="storage" element={
                  <Storages
                    getLogin={getLogin}
                    reviewContainerIf={reviewContainerIf}
                    createBeerIf={createBeerIf}
                    createStorageIf={createStorageIf}
                  />
                } />
              </React.Fragment>
            )}
            <Route
              path="*"
              element={isLoggedIn ?
                <Beers /> : <LoginComponent loginIf={loginIf}/>} />
          </Route>
        </Routes>
        <div id='content-end'>&nbsp;</div>
      </div>
    </div>
  )
}

export default App
