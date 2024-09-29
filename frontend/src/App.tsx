import React, { useEffect, useId, useState } from 'react'
import { Routes, Route, Link, Outlet } from 'react-router-dom'

import { activate, selectActiveSearch } from './store/search/reducer'
import { useDispatch, useSelector } from './react-redux-wrapper'
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
  GetBreweryIf,
  ListBreweriesIf,
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

import type {
  CreateReviewIf,
  FilteredListReviewParams,
  GetReviewIf,
  ListReviewParams,
  ListReviewsByIf,
  ListReviewsIf,
  ReviewRequestWrapper,
  ReviewContainerIf,
  UpdateReviewIf,
  Review,
  ReviewIf
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
  ListBeersIf,
  SearchBeerIf,
  SelectBeerIf,
  UpdateBeerIf
} from './core/beer/types'
import {
  useCreateBeerMutation,
  useGetBeerQuery,
  useLazyListBeersQuery,
  useLazySearchBeersQuery,
  useUpdateBeerMutation
} from './store/beer/api'
import {
  useCreateBreweryMutation,
  useGetBreweryQuery,
  useLazyListBreweriesQuery,
  useLazySearchBreweriesQuery,
  useUpdateBreweryMutation
} from './store/brewery/api'
import type {
  CreateStorageIf,
  CreateStorageRequest,
  GetStorageIf,
  ListStoragesByIf,
  ListStoragesIf
} from './core/storage/types'
import {
  useCreateStorageMutation,
  useGetStorageQuery,
  useListStoragesByBeerQuery,
  useListStoragesByBreweryQuery,
  useListStoragesByStyleQuery,
  useListStoragesQuery
} from './store/storage/api'
import {
  useCreateReviewMutation,
  useLazyGetReviewQuery,
  useLazyListReviewsQuery,
  useListReviewsByBeerQuery,
  useListReviewsByBreweryQuery,
  useListReviewsByStyleQuery,
  useUpdateReviewMutation
} from './store/review/api'
import type {
  BreweryStatsQueryParams,
  BreweryStyleParams,
  StatsIf,
  StyleStatsQueryParams
} from './core/stats/types'
import {
  useGetAnnualStatsQuery,
  useGetOverallStatsQuery,
  useGetRatingStatsQuery,
  useGetStyleStatsQuery,
  useLazyGetBreweryStatsQuery
} from './store/stats/api'
import type { Pagination } from './core/types'
import type { SearchIf } from './core/search/types'
import {
  type NavigateIf,
  navigateIf,
  paramsIf,
  useDebounce
} from './components/util'

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

function App (): React.JSX.Element {
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

  const listBeersIf: ListBeersIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized } ] =
        useLazyListBeersQuery()
      return {
        beerList: data,
        list: async (pagination: Pagination) => {
          const result = await trigger(pagination).unwrap()
          return result
        },
        isLoading: isFetching,
        isUninitialized
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

  const getBreweryIf: GetBreweryIf = {
    useGet: (breweryId: string) => {
      const { data, isLoading } = useGetBreweryQuery(breweryId)
      return {
        brewery: data?.brewery,
        isLoading
      }
    }
  }

  const listBreweriesIf: ListBreweriesIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized } ] =
        useLazyListBreweriesQuery()
      return {
        breweryList: data,
        list: async (pagination: Pagination) => {
          const result = await trigger(pagination).unwrap()
          return result
        },
        isLoading: isFetching,
        isUninitialized
      }
    }
  }

  const searchBreweryIf: SearchBreweryIf = {
    useSearch: () => {
      const [
        searchBrewery,
        { isFetching }
      ] = useLazySearchBreweriesQuery()
      return {
        search: async (name: string) => {
          const result = await searchBrewery(name).unwrap()
          return result.breweries
        },
        isLoading: isFetching
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

  const searchBeerIf: SearchBeerIf = {
    useSearch: () => {
      const [ searchBeers, { isFetching } ] = useLazySearchBeersQuery()
      return {
        search: async (query: string) => {
          const results = await searchBeers(query).unwrap()
          return results.beers
        },
        isLoading: isFetching
      }
    }
  }

  const selectBeerIf: SelectBeerIf = {
    create: createBeerIf,
    search: searchBeerIf
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
  const isLoggedIn: boolean = login.authToken.length > 0
  const isAdmin = login.user?.role === Role.admin

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

  const getStorageIf: GetStorageIf = {
    useGet: (storageId: string) => {
      const { data, isLoading } = useGetStorageQuery(storageId)
      return {
        storage: data?.storage,
        isLoading
      }
    }
  }

  const listStoragesIf: ListStoragesIf = {
    useList: () => {
      const { data, isLoading } = useListStoragesQuery()
      return {
        storages: data,
        isLoading
      }
    }
  }

  const listStoragesByBeerIf: ListStoragesByIf = {
    useList: (beerId: string) => {
      const { data, isLoading } = useListStoragesByBeerQuery(beerId)
      return {
        storages: data,
        isLoading
      }
    }
  }

  const listStoragesByBreweryIf: ListStoragesByIf = {
    useList: (breweryId: string) => {
      const { data, isLoading } = useListStoragesByBreweryQuery(breweryId)
      return {
        storages: data,
        isLoading
      }
    }
  }

  const listStoragesByStyleIf: ListStoragesByIf = {
    useList: (breweryId: string) => {
      const { data, isLoading } = useListStoragesByStyleQuery(breweryId)
      return {
        storages: data,
        isLoading
      }
    }
  }

  const getReviewIf: GetReviewIf = {
    useGet: () => {
      const [getReview] = useLazyGetReviewQuery()
      return {
        get: async (reviewId: string) => {
          return (await getReview(reviewId).unwrap()).review
        }
      }
    }
  }

  const listReviewsIf: ListReviewsIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized }] =
        useLazyListReviewsQuery()
      return {
        reviewList: data,
        list: async (params: ListReviewParams) => {
          const result = await trigger(params).unwrap()
          return result
        },
        isLoading: isFetching,
        isUninitialized
      }
    }
  }

  const listReviewsByBeerIf: ListReviewsByIf = {
    useList: (params: FilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByBeerQuery(params)
      return {
        reviews: data,
        isLoading
      }
    }
  }

  const listReviewsByBreweryIf: ListReviewsByIf = {
    useList: (params: FilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByBreweryQuery(params)
      return {
        reviews: data,
        isLoading
      }
    }
  }

  const listReviewsByStyleIf: ListReviewsByIf = {
    useList: (params: FilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByStyleQuery(params)
      return {
        reviews: data,
        isLoading
      }
    }
  }

  const createReviewIf: CreateReviewIf = {
    useCreate: () => {
      const [ createReview, { isLoading, isSuccess, data }] =
        useCreateReviewMutation()
      return {
        create: async (request: ReviewRequestWrapper) => {
          await createReview(request)
        },
        isLoading,
        isSuccess,
        review: data?.review
      }
    },
    getCurrentDate: () => new Date(),
    selectBeerIf,
    reviewContainerIf
  }

  const updateReviewIf: UpdateReviewIf = {
    useUpdate: () => {
      const [updateReview, { isLoading }] = useUpdateReviewMutation()
      return {
        update: async (review: Review) => {
          await updateReview(review)
        },
        isLoading
      }
    },
    selectBeerIf,
    reviewContainerIf
  }

  const reviewIf: ReviewIf = {
    get: getReviewIf,
    update: updateReviewIf,
    login: getLogin
  }

  const statsIf: StatsIf = {
    annual: {
      useStats: (params: BreweryStyleParams) => {
        const { data, isLoading } = useGetAnnualStatsQuery(params)
        return {
          stats: data,
          isLoading
        }
      }
    },
    brewery: {
      useStats: () => {
        const [trigger, { data, isFetching }] =
          useLazyGetBreweryStatsQuery()
        return {
          query: async (
            params: BreweryStatsQueryParams
          ) => (await trigger(params)).data,
          stats: data,
          isLoading: isFetching
        }
      }
    },
    overall: {
      useStats: (params: BreweryStyleParams) => {
        const { data, isLoading } = useGetOverallStatsQuery(params)
        return {
          stats: data?.overall,
          isLoading
        }
      }
    },
    rating: {
      useStats: (params: BreweryStyleParams) => {
        const { data, isLoading } = useGetRatingStatsQuery(params)
        return {
          stats: data,
          isLoading
        }
      }
    },
    style: {
      useStats: (params: StyleStatsQueryParams) => {
        const { data, isLoading } = useGetStyleStatsQuery(params)
        return {
          stats: data,
          isLoading
        }
      }
    }
  }

  const searchIf: SearchIf = {
    useSearch: () => {
      const activeSearch: string = useSelector(selectActiveSearch)
      const dispatch = useDispatch()
      const id = useId()
      const isActive = activeSearch === id
      return {
        activate: () => {
          dispatch(activate(id))
        },
        isActive
      }
    },
    useDebounce
  }

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
        <div id='content-end'>&nbsp;</div>
      </div>
    </div>
  )
}

export default App
