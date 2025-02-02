import React from 'react'

import { useSelector } from './react-redux-wrapper'
import type {
  CreateUserIf,
  DeleteUserIf,
  ListUsersIf,
  UserIf
} from './core/user/types'

import './App.css'

import App from './App.tsx'

import { selectLogin } from './store/login/reducer'
import type {
  SelectBreweryIf,
  CreateBreweryIf,
  GetBreweryIf,
  ListBreweriesIf,
  SearchBreweryIf,
  UpdateBreweryIf
} from './core/brewery/types'
import type {
  CreateContainerIf,
  ListContainersIf,
  UpdateContainerIf
} from './core/container/types'
import type {
  CreateLocationIf,
  GetLocationIf,
  ListLocationsIf,
  SearchLocationIf,
  UpdateLocationIf
} from './core/location/types'
import type {
  CreateReviewIf,
  GetReviewIf,
  ListReviewsByIf,
  ListReviewsIf,
  ReviewContainerIf,
  UpdateReviewIf,
  ReviewIf
} from './core/review/types'
import type {
  CreateStyleIf,
  GetStyleIf,
  ListStylesIf,
  SelectStyleIf,
  UpdateStyleIf
} from './core/style/types'
import type {
  ChangePasswordIf,
  GetLogin,
  Login,
  LoginIf,
  LogoutIf,
} from './core/login/types'
import type {
  CreateBeerIf,
  EditBeerIf,
  GetBeerIf,
  ListBeersIf,
  SearchBeerIf,
  SelectBeerIf,
  UpdateBeerIf
} from './core/beer/types'
import type {
  CreateStorageIf,
  DeleteStorageIf,
  GetStorageIf,
  ListStoragesByIf,
  ListStoragesIf
} from './core/storage/types'
import type {
  StatsIf,
} from './core/stats/types'
import type { SearchIf } from './core/search/types'
import {
  infiniteScroll,
  navigateIf,
  paramsIf,
  useDebounce
} from './components/util'
import type { StoreIf } from './store/storeIf'

import createBeer from './storehookifs/beer/create'
import getBeer from './storehookifs/beer/get'
import listBeers from './storehookifs/beer/list'
import searchBeer from './storehookifs/beer/search'
import updateBeer from './storehookifs/beer/update'

import createBrewery from './storehookifs/brewery/create'
import getBrewery from './storehookifs/brewery/get'
import listBreweries from './storehookifs/brewery/list'
import searchBrewery from './storehookifs/brewery/search'
import updateBrewery from './storehookifs/brewery/update'

import createContainer from './storehookifs/container/create'
import listContainers from './storehookifs/container/list'
import updateContainer from './storehookifs/container/update'

import createLocation from './storehookifs/location/create'
import getLocation from './storehookifs/location/get'
import listLocations from './storehookifs/location/list'
import searchLocation from './storehookifs/location/search'
import updateLocation from './storehookifs/location/update'

import createReview from './storehookifs/review/create'
import getReview from './storehookifs/review/get'
import listReviews from './storehookifs/review/list'
import listReviewsByBeer from './storehookifs/review/listByBeer'
import listReviewsByBrewery from './storehookifs/review/listByBrewery'
import listReviewsByStyle from './storehookifs/review/listByStyle'
import updateReview from './storehookifs/review/update'

import search from './storehookifs/search'

import stats from './storehookifs/stats'

import createStorage from './storehookifs/storage/create'
import getStorage from './storehookifs/storage/get'
import deleteStorage from './storehookifs/storage/delete'
import listStorages from './storehookifs/storage/list'
import listStoragesByBeer from './storehookifs/storage/listByBeer'
import listStoragesByBrewery from './storehookifs/storage/listByBrewery'
import listStoragesByStyle from './storehookifs/storage/listByStyle'

import createStyle from './storehookifs/style/create'
import getStyle from './storehookifs/style/get'
import listStyles from './storehookifs/style/list'
import updateStyle from './storehookifs/style/update'

import createUser from './storehookifs/user/create'
import deleteUser from './storehookifs/user/delete'
import listUsers from './storehookifs/user/list'

import changePassword from './storehookifs/login/changePassword'
import login from './storehookifs/login/login'
import logout from './storehookifs/login/logout'

function RtkApp (): React.JSX.Element {
  const createBreweryIf: CreateBreweryIf = createBrewery()
  const getBreweryIf: GetBreweryIf = getBrewery()
  const listBreweriesIf: ListBreweriesIf = listBreweries()
  const searchBreweryIf: SearchBreweryIf = searchBrewery()
  const updateBreweryIf: UpdateBreweryIf = updateBrewery()
  const selectBreweryIf: SelectBreweryIf = {
    create: createBreweryIf,
    search: searchBreweryIf
  }

  const createContainerIf: CreateContainerIf = createContainer()
  const listContainersIf: ListContainersIf = listContainers()
  const updateContainerIf: UpdateContainerIf = updateContainer()
  const reviewContainerIf: ReviewContainerIf = {
    createIf: createContainerIf,
    listIf: listContainersIf
  }

  const createUserIf: CreateUserIf = createUser()
  const deleteUserIf: DeleteUserIf = deleteUser()
  const listUsersIf: ListUsersIf = listUsers()

  const userIf: UserIf = {
    create: createUserIf,
    delete: deleteUserIf,
    list: listUsersIf
  }

  const createStyleIf: CreateStyleIf = createStyle()
  const getStyleIf: GetStyleIf = getStyle()
  const listStylesIf: ListStylesIf = listStyles()
  const updateStyleIf: UpdateStyleIf = updateStyle()
  const selectStyleIf: SelectStyleIf = {
    create: createStyleIf,
    list: listStylesIf
  }

  const getBeerIf: GetBeerIf = getBeer()
  const listBeersIf: ListBeersIf = listBeers()

  const editBeerIf: EditBeerIf = {
    selectBreweryIf,
    selectStyleIf
  }

  const createBeerIf: CreateBeerIf = createBeer(editBeerIf)
  const searchBeerIf: SearchBeerIf = searchBeer()
  const updateBeerIf: UpdateBeerIf = updateBeer(editBeerIf)
  const selectBeerIf: SelectBeerIf = {
    create: createBeerIf,
    search: searchBeerIf
  }

  const changePasswordIf: ChangePasswordIf = changePassword()
  const loginIf: LoginIf = login()
  const logoutIf: LogoutIf = logout()
  const getLogin: GetLogin = () => {
    const login: Login = useSelector(selectLogin)
    return login
  }

  const createLocationIf: CreateLocationIf = createLocation()
  const getLocationIf: GetLocationIf = getLocation()
  const listLocationsIf: ListLocationsIf = listLocations()
  const searchLocationIf: SearchLocationIf = searchLocation(createLocationIf)
  const updateLocationIf: UpdateLocationIf = updateLocation(getLogin)

  const createStorageIf: CreateStorageIf = createStorage()
  const getStorageIf: GetStorageIf = getStorage()
  const deleteStorageIf: DeleteStorageIf = deleteStorage()
  const listStoragesIf: ListStoragesIf = listStorages(deleteStorageIf)
  const listStoragesByBeerIf: ListStoragesByIf =
    listStoragesByBeer(deleteStorageIf)
  const listStoragesByBreweryIf: ListStoragesByIf =
    listStoragesByBrewery(deleteStorageIf)
  const listStoragesByStyleIf: ListStoragesByIf =
    listStoragesByStyle(deleteStorageIf)

  const getReviewIf: GetReviewIf = getReview()
  const listReviewsIf: ListReviewsIf = listReviews(infiniteScroll)
  const listReviewsByBeerIf: ListReviewsByIf = listReviewsByBeer()
  const listReviewsByBreweryIf: ListReviewsByIf = listReviewsByBrewery()
  const listReviewsByStyleIf: ListReviewsByIf = listReviewsByStyle()
  const createReviewIf: CreateReviewIf = createReview(
    () => new Date(),
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf
  )
  const updateReviewIf: UpdateReviewIf = updateReview(
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf
  )
  const reviewIf: ReviewIf = {
    get: getReviewIf,
    update: updateReviewIf,
    login: getLogin
  }

  const statsIf: StatsIf = stats(infiniteScroll, navigateIf)

  const searchIf: SearchIf = search(useDebounce)

  const storeIf: StoreIf = {
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

    getLocationIf,
    listLocationsIf,
    searchLocationIf,
    updateLocationIf,

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
  }

  return (
    <App
      paramsIf={paramsIf}
      storeIf={storeIf}
    />
  )
}

export default RtkApp
