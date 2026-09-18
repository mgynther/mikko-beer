import React from 'react'

import { useSelector } from './react-redux-wrapper'
import type {
  CreateUserIf,
  DeleteUserIf,
  ListUsersIf,
  UserIf,
} from './types/user/types'

import './App.css'

import App from './App.tsx'

import { selectLogin } from './store/login/reducer'
import type {
  SelectBreweryIf,
  CreateBreweryIf,
  GetBreweryIf,
  ListBreweriesIf,
  SearchBreweryIf,
  UpdateBreweryIf,
} from './types/brewery/types'
import type {
  CreateContainerIf,
  ListContainersIf,
  UpdateContainerIf,
} from './types/container/types'
import type {
  CreateLocationIf,
  GetLocationIf,
  ListLocationsIf,
  SearchLocationIf,
  UpdateLocationIf,
} from './types/location/types'
import type {
  CreateReviewIf,
  GetReviewIf,
  ListReviewsByIf,
  ListReviewsIf,
  ReviewContainerIf,
  UpdateReviewIf,
  ReviewIf,
  ListFilterIf,
} from './types/review/types'
import type {
  CreateStyleIf,
  GetStyleIf,
  ListStylesIf,
  SelectStyleIf,
  UpdateStyleIf,
} from './types/style/types'
import type {
  ChangePasswordIf,
  GetLogin,
  Login,
  LoginIf,
  LogoutIf,
} from './types/login/types'
import type {
  CreateBeerIf,
  EditBeerIf,
  GetBeerIf,
  ListBeersIf,
  SearchBeerIf,
  SelectBeerIf,
  UpdateBeerLoginIf,
} from './types/beer/types'
import type {
  CreateStorageIf,
  DeleteStorageIf,
  GetAnnualStorageStatsIf,
  GetMonthlyStorageStatsIf,
  GetStorageIf,
  ListStoragesByIf,
  ListStoragesIf,
  StorageStatsIf,
} from './types/storage/types'
import type { StatsHookIf, StatsIf } from './types/stats/types'
import type { SearchFieldIf } from './types/search/types'
import {
  getUseDebounce,
  infiniteScroll,
  useDebounce,
  useUrlPathParams,
  useUrlSearchParams,
} from './components/util'
import { navigateIf } from './navigation'
import type { StoreIf } from './store/storeIf'

import createBeer from './storehooks/beer/create'
import getBeer from './storehooks/beer/get'
import listBeers from './storehooks/beer/list'
import searchBeer from './storehooks/beer/search'
import updateBeer from './storehooks/beer/update'

import createBrewery from './storehooks/brewery/create'
import getBrewery from './storehooks/brewery/get'
import listBreweries from './storehooks/brewery/list'
import searchBrewery from './storehooks/brewery/search'
import updateBrewery from './storehooks/brewery/update'

import createContainer from './storehooks/container/create'
import listContainers from './storehooks/container/list'
import updateContainer from './storehooks/container/update'

import createLocation from './storehooks/location/create'
import getLocation from './storehooks/location/get'
import listLocations from './storehooks/location/list'
import searchLocation from './storehooks/location/search'
import updateLocation from './storehooks/location/update'

import createReview from './storehooks/review/create'
import getReview from './storehooks/review/get'
import listReviews from './storehooks/review/list'
import listReviewsByBeer from './storehooks/review/listByBeer'
import listReviewsByBrewery from './storehooks/review/listByBrewery'
import listReviewsByLocation from './storehooks/review/listByLocation'
import listReviewsByStyle from './storehooks/review/listByStyle'
import updateReview from './storehooks/review/update'

import searchField from './storehooks/search-field'

import stats from './storehooks/stats/stats'

import createStorage from './storehooks/storage/create'
import getAnnualStorageStats from './storehooks/storage/annualStats'
import getMonthlyStorageStats from './storehooks/storage/monthlyStats'
import getStorage from './storehooks/storage/get'
import deleteStorage from './storehooks/storage/delete'
import listStorages from './storehooks/storage/list'
import listStoragesByBeer from './storehooks/storage/listByBeer'
import listStoragesByBrewery from './storehooks/storage/listByBrewery'
import listStoragesByStyle from './storehooks/storage/listByStyle'

import createStyle from './storehooks/style/create'
import getStyle from './storehooks/style/get'
import listStyles from './storehooks/style/list'
import updateStyle from './storehooks/style/update'

import createUser from './storehooks/user/create'
import deleteUser from './storehooks/user/delete'
import listUsers from './storehooks/user/list'

import changePassword from './storehooks/login/changePassword'
import login from './storehooks/login/login'
import logout from './storehooks/login/logout'
import { createSetSearch } from './set-search.ts'
import { getDate } from './date-getter.ts'
import type { YearMonth } from './types/types.ts'

function getNextMonthDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

function RtkApp(): React.JSX.Element {
  const createBreweryIf: CreateBreweryIf = createBrewery()
  const getBreweryIf: GetBreweryIf = getBrewery()
  const listBreweriesIf: ListBreweriesIf = listBreweries()

  const searchFieldIf: SearchFieldIf = {
    ...searchField(),
    useDebounce: useDebounce<string>,
  }

  const getLogin: GetLogin = () => {
    const login: Login = useSelector(selectLogin)
    return login
  }

  const searchBreweryIf: SearchBreweryIf = {
    ...searchBrewery(),
    searchFieldIf,
  }
  const updateBreweryIf: UpdateBreweryIf = {
    ...updateBrewery(),
    getLogin,
  }
  const selectBreweryIf: SelectBreweryIf = {
    create: createBreweryIf,
    search: searchBreweryIf,
  }

  const createContainerIf: CreateContainerIf = createContainer()
  const listContainersIf: ListContainersIf = listContainers()
  const updateContainerIf: UpdateContainerIf = {
    ...updateContainer(),
    getLogin,
  }
  const reviewContainerIf: ReviewContainerIf = {
    createIf: createContainerIf,
    listIf: listContainersIf,
  }

  const createUserIf: CreateUserIf = createUser()
  const deleteUserIf: DeleteUserIf = deleteUser()
  const listUsersIf: ListUsersIf = listUsers()

  const userIf: UserIf = {
    create: createUserIf,
    delete: deleteUserIf,
    list: listUsersIf,
  }

  const createStyleIf: CreateStyleIf = createStyle()
  const getStyleIf: GetStyleIf = getStyle()
  const listStylesIf: ListStylesIf = {
    ...listStyles(),
    searchFieldIf,
  }
  const updateStyleIf: UpdateStyleIf = {
    ...updateStyle(),
    getLogin,
  }
  const selectStyleIf: SelectStyleIf = {
    create: createStyleIf,
    list: listStylesIf,
  }

  const getBeerIf: GetBeerIf = getBeer()
  const listBeersIf: ListBeersIf = {
    ...listBeers(),
    infiniteScroll,
  }

  const editBeerIf: EditBeerIf = {
    selectBreweryIf,
    selectStyleIf,
  }

  const createBeerIf: CreateBeerIf = {
    ...createBeer(),
    editBeerIf,
  }
  const searchBeerIf: SearchBeerIf = {
    ...searchBeer(),
    searchFieldIf,
  }
  const updateBeerLoginIf: UpdateBeerLoginIf = {
    ...updateBeer(),
    editBeerIf,
    getLogin,
  }
  const selectBeerIf: SelectBeerIf = {
    create: createBeerIf,
    search: searchBeerIf,
  }

  const changePasswordIf: ChangePasswordIf = {
    ...changePassword(),
    getLogin,
  }
  const loginIf: LoginIf = login()
  const logoutIf: LogoutIf = logout()

  const createLocationIf: CreateLocationIf = createLocation()
  const getLocationIf: GetLocationIf = getLocation()
  const listLocationsIf: ListLocationsIf = {
    ...listLocations(),
    infiniteScroll,
  }
  const searchLocationIf: SearchLocationIf = {
    ...searchLocation(),
    create: createLocationIf,
    searchFieldIf,
  }
  const updateLocationIf: UpdateLocationIf = {
    ...updateLocation(),
    getLogin,
  }

  const createStorageIf: CreateStorageIf = createStorage()
  const getAnnualStorageStatsIf: GetAnnualStorageStatsIf =
    getAnnualStorageStats()
  const getMonthlyStorageStatsIf: GetMonthlyStorageStatsIf =
    getMonthlyStorageStats()
  const setSearch = createSetSearch(window.location.pathname, navigateIf)
  const storageStatsIf: StorageStatsIf = {
    annual: getAnnualStorageStatsIf,
    monthly: getMonthlyStorageStatsIf,
    setSearch: setSearch.stats,
    useUrlSearchParams,
  }
  const getStorageIf: GetStorageIf = getStorage()
  const deleteStorageIf: DeleteStorageIf = {
    ...deleteStorage(),
    getLogin,
  }
  const listStoragesIf: ListStoragesIf = {
    ...listStorages(),
    delete: deleteStorageIf,
  }
  const listStoragesByBeerIf: ListStoragesByIf = {
    ...listStoragesByBeer(),
    delete: deleteStorageIf,
  }
  const listStoragesByBreweryIf: ListStoragesByIf = {
    ...listStoragesByBrewery(),
    delete: deleteStorageIf,
  }
  const listStoragesByStyleIf: ListStoragesByIf = {
    ...listStoragesByStyle(),
    delete: deleteStorageIf,
  }

  const minTime: YearMonth = {
    year: 2017,
    month: 12,
  }
  const [nextMonthDate] = React.useState(getNextMonthDate())
  const maxTime: YearMonth = {
    year: nextMonthDate.getFullYear(),
    month: nextMonthDate.getMonth() + 1,
  }

  const getReviewIf: GetReviewIf = getReview()
  const listReviewsFilterIf: ListFilterIf = {
    getUseDebounce,
    minTime,
    maxTime,
    setSearch: setSearch.reviewList,
    useUrlSearchParams,
  }
  const listReviewsIf: ListReviewsIf = {
    ...listReviews(),
    infiniteScroll,
    filterIf: listReviewsFilterIf,
  }
  const updateReviewIf: UpdateReviewIf = {
    ...updateReview(),
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf,
  }
  const reviewIf: ReviewIf = {
    get: getReviewIf,
    update: updateReviewIf,
    getLogin,
  }
  const listReviewsByBeerIf: ListReviewsByIf = {
    ...listReviewsByBeer(),
    filterIf: listReviewsFilterIf,
    reviewIf,
  }
  const listReviewsByBreweryIf: ListReviewsByIf = {
    ...listReviewsByBrewery(),
    filterIf: listReviewsFilterIf,
    reviewIf,
  }
  const listReviewsByLocationIf: ListReviewsByIf = {
    ...listReviewsByLocation(),
    filterIf: listReviewsFilterIf,
    reviewIf,
  }
  const listReviewsByStyleIf: ListReviewsByIf = {
    ...listReviewsByStyle(),
    filterIf: listReviewsFilterIf,
    reviewIf,
  }
  const createReviewIf: CreateReviewIf = {
    ...createReview(),
    getCurrentDate: getDate,
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf,
  }

  const statsHookIf: StatsHookIf = stats()
  const statsIf: StatsIf = {
    annual: statsHookIf.annual,
    annualContainer: {
      ...statsHookIf.annualContainer,
      infiniteScroll,
    },
    brewery: {
      ...statsHookIf.brewery,
      infiniteScroll,
      minTime,
      maxTime,
      getUseDebounce,
    },
    breweryCountry: {
      ...statsHookIf.breweryCountry,
      infiniteScroll,
      minTime,
      maxTime,
      getUseDebounce,
    },
    container: statsHookIf.container,
    location: {
      ...statsHookIf.location,
      infiniteScroll,
      minTime,
      maxTime,
      getUseDebounce,
    },
    overall: statsHookIf.overall,
    rating: statsHookIf.rating,
    style: {
      ...statsHookIf.style,
      minTime,
      maxTime,
      getUseDebounce,
    },
    setSearch: setSearch.stats,
    useUrlSearchParams,
  }

  const storeIf: StoreIf = {
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
    listReviewsByLocationIf,
    listReviewsByStyleIf,
    reviewIf,

    statsIf,

    searchFieldIf: searchFieldIf,

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
  }

  return <App useUrlPathParams={useUrlPathParams} storeIf={storeIf} />
}

export default RtkApp
