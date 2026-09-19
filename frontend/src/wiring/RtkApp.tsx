import React, { useId } from 'react'

import type {
  CreateUserIf,
  DeleteUserIf,
  ListUsersIf,
  UserIf,
} from '../components/types/user/types'

import App from './App.tsx'

import type {
  SelectBreweryIf,
  CreateBreweryIf,
  GetBreweryIf,
  ListBreweriesIf,
  SearchBreweryIf,
  UpdateBreweryIf,
} from '../components/types/brewery/types'
import type {
  CreateContainerIf,
  ListContainersIf,
  UpdateContainerIf,
} from '../components/types/container/types'
import type {
  CreateLocationIf,
  GetLocationIf,
  ListLocationsIf,
  SearchLocationIf,
  UpdateLocationIf,
} from '../components/types/location/types'
import type {
  CreateReviewIf,
  GetReviewIf,
  ListReviewsByIf,
  ListReviewsIf,
  ReviewContainerIf,
  UpdateReviewIf,
  ReviewIf,
  ListFilterIf,
} from '../components/types/review/types'
import type {
  CreateStyleIf,
  GetStyleIf,
  ListStylesIf,
  SelectStyleIf,
  UpdateStyleIf,
} from '../components/types/style/types'
import type {
  ChangePasswordIf,
  GetLogin,
  LoginIf,
  LogoutIf,
} from '../components/types/login/types'
import type {
  CreateBeerIf,
  EditBeerIf,
  GetBeerIf,
  ListBeersIf,
  SearchBeerIf,
  SelectBeerIf,
  UpdateBeerLoginIf,
} from '../components/types/beer/types'
import type {
  CreateStorageIf,
  DeleteStorageIf,
  GetAnnualStorageStatsIf,
  GetMonthlyStorageStatsIf,
  GetStorageIf,
  ListStoragesByIf,
  ListStoragesIf,
  StorageStatsIf,
} from '../components/types/storage/types'
import type { StatsHookIf, StatsIf } from '../components/types/stats/types'
import type { SearchFieldIf } from '../components/types/search/types'
import { getUseDebounce, infiniteScroll, useDebounce } from '../components/util'
import { useUrlPathParams, useUrlSearchParams } from '../routing/url-params'
import { Link } from '../routing/link'
import { navigateIf } from '../routing/navigate'
import type { StoreIf } from '../components/types/storeIf'

import {
  useCreateBeer,
  useGetBeer,
  useListBeers,
  useSearchBeers,
  useUpdateBeer,
} from '../store/beer'
import {
  validateBeerList,
  validateBeerListOrUndefined,
  validateBeerOrUndefined,
  validateBeerWithIds,
} from '../validation/beer'

import createBeer from '../storehooks/beer/create'
import getBeer from '../storehooks/beer/get'
import listBeers from '../storehooks/beer/list'
import searchBeer from '../storehooks/beer/search'
import updateBeer from '../storehooks/beer/update'

import {
  useCreateBrewery,
  useGetBrewery,
  useListBreweries,
  useSearchBreweries,
  useUpdateBrewery,
} from '../store/brewery'
import {
  validateBrewery,
  validateBreweryList,
  validateBreweryListOrUndefined,
  validateBreweryOrUndefined,
} from '../validation/brewery'

import createBrewery from '../storehooks/brewery/create'
import getBrewery from '../storehooks/brewery/get'
import listBreweries from '../storehooks/brewery/list'
import searchBrewery from '../storehooks/brewery/search'
import updateBrewery from '../storehooks/brewery/update'

import {
  useCreateContainer,
  useListContainers,
  useUpdateContainer,
} from '../store/container'
import {
  validateContainer,
  validateContainerListOrUndefined,
} from '../validation/container'

import createContainer from '../storehooks/container/create'
import listContainers from '../storehooks/container/list'
import updateContainer from '../storehooks/container/update'

import {
  useCreateLocation,
  useGetLocation,
  useListLocations,
  useSearchLocations,
  useUpdateLocation,
} from '../store/location'
import {
  validateLocation,
  validateLocationList,
  validateLocationListOrUndefined,
  validateLocationOrUndefined,
} from '../validation/location'

import createLocation from '../storehooks/location/create'
import getLocation from '../storehooks/location/get'
import listLocations from '../storehooks/location/list'
import searchLocation from '../storehooks/location/search'
import updateLocation from '../storehooks/location/update'

import {
  useCreateReview,
  useGetReview,
  useListReviews,
  useListReviewsByBeer,
  useListReviewsByBrewery,
  useListReviewsByLocation,
  useListReviewsByStyle,
  useUpdateReview,
} from '../store/review'
import {
  validateJoinedReviewList,
  validateJoinedReviewListOrUndefined,
  validateReview,
  validateReviewOrUndefined,
} from '../validation/review'

import createReview from '../storehooks/review/create'
import getReview from '../storehooks/review/get'
import listReviews from '../storehooks/review/list'
import listReviewsByBeer from '../storehooks/review/listByBeer'
import listReviewsByBrewery from '../storehooks/review/listByBrewery'
import listReviewsByLocation from '../storehooks/review/listByLocation'
import listReviewsByStyle from '../storehooks/review/listByStyle'
import updateReview from '../storehooks/review/update'

import searchField from '../store/search'

import {
  useGetAnnualContainerStats,
  useGetAnnualStats,
  useGetBreweryCountryStats,
  useGetBreweryStats,
  useGetContainerStats,
  useGetLocationStats,
  useGetOverallStats,
  useGetRatingStats,
  useGetStyleStats,
} from '../store/stats'
import {
  validateAnnualContainerStats,
  validateAnnualContainerStatsOrUndefined,
  validateAnnualStatsOrUndefined,
  validateBreweryCountryStats,
  validateBreweryCountryStatsOrUndefined,
  validateBreweryStats,
  validateBreweryStatsOrUndefined,
  validateContainerStatsOrUndefined,
  validateLocationStats,
  validateLocationStatsOrUndefined,
  validateOverallStatsOrUndefined,
  validateRatingStatsOrUndefined,
  validateStyleStatsOrUndefined,
} from '../validation/stats'

import stats from '../storehooks/stats/stats'

import {
  useCreateStorage,
  useDeleteStorage,
  useGetAnnualStorageStats,
  useGetMonthlyStorageStats,
  useGetStorage,
  useListStorages,
  useListStoragesByBeer,
  useListStoragesByBrewery,
  useListStoragesByStyle,
} from '../store/storage'
import {
  validateAnnualStorageStatsOrUndefined,
  validateCreatedStorage,
  validateMonthlyStorageStatsOrUndefined,
  validateStorageListOrUndefined,
  validateStorageOrUndefined,
} from '../validation/storage'

import createStorage from '../storehooks/storage/create'
import getAnnualStorageStats from '../storehooks/storage/annualStats'
import getMonthlyStorageStats from '../storehooks/storage/monthlyStats'
import getStorage from '../storehooks/storage/get'
import deleteStorage from '../storehooks/storage/delete'
import listStorages from '../storehooks/storage/list'
import listStoragesByBeer from '../storehooks/storage/listByBeer'
import listStoragesByBrewery from '../storehooks/storage/listByBrewery'
import listStoragesByStyle from '../storehooks/storage/listByStyle'

import {
  useCreateStyle,
  useGetStyle,
  useListStyles,
  useUpdateStyle,
} from '../store/style'
import {
  validateStyle,
  validateStyleListOrUndefined,
  validateStyleOrUndefined,
  validateStyleWithParentsAndChildrenOrUndefined,
} from '../validation/style'

import createStyle from '../storehooks/style/create'
import getStyle from '../storehooks/style/get'
import listStyles from '../storehooks/style/list'
import updateStyle from '../storehooks/style/update'

import { useCreateUser, useDeleteUser, useListUsers } from '../store/user'
import {
  validateUserListOrUndefined,
  validateUserOrUndefined,
} from '../validation/user'

import createUser from '../storehooks/user/create'
import deleteUser from '../storehooks/user/delete'
import listUsers from '../storehooks/user/list'

import {
  useChangePassword,
  useLogin,
  useLogout,
  usePasswordChangeResult,
  useSaveLogin,
  useStoredLogin,
} from '../store/login'
import { useNavMenu } from '../store/nav-menu'
import { useTheme } from '../store/theme'
import { validateLogin } from '../validation/login'

import changePassword from '../storehooks/login/changePassword'
import getLoginHook from '../storehooks/login/getLogin'
import login from '../storehooks/login/login'
import logout from '../storehooks/login/logout'
import { createSetSearch } from '../routing/set-search'
import { getDate, getNextMonthDate } from './date-getter.ts'
import type { YearMonth } from '../components/types/types.ts'

function RtkApp(): React.JSX.Element {
  const createBreweryIf: CreateBreweryIf = createBrewery(
    useCreateBrewery,
    validateBrewery,
  )
  const getBreweryIf: GetBreweryIf = getBrewery(
    useGetBrewery,
    validateBreweryOrUndefined,
  )
  const listBreweriesIf: ListBreweriesIf = {
    ...listBreweries(
      useListBreweries,
      validateBreweryList,
      validateBreweryListOrUndefined,
    ),
    infiniteScroll,
  }

  const searchFieldIf: SearchFieldIf = {
    ...searchField(useId),
    useDebounce: useDebounce<string>,
  }

  const getLogin: GetLogin = getLoginHook(useStoredLogin, validateLogin)

  const searchBreweryIf: SearchBreweryIf = {
    ...searchBrewery(useSearchBreweries, validateBreweryList),
    searchFieldIf,
  }
  const updateBreweryIf: UpdateBreweryIf = {
    ...updateBrewery(useUpdateBrewery, validateBrewery),
    getLogin,
  }
  const selectBreweryIf: SelectBreweryIf = {
    create: createBreweryIf,
    search: searchBreweryIf,
  }

  const createContainerIf: CreateContainerIf = createContainer(
    useCreateContainer,
    validateContainer,
  )
  const listContainersIf: ListContainersIf = listContainers(
    useListContainers,
    validateContainerListOrUndefined,
  )
  const updateContainerIf: UpdateContainerIf = {
    ...updateContainer(useUpdateContainer, validateContainer),
    getLogin,
  }
  const reviewContainerIf: ReviewContainerIf = {
    createIf: createContainerIf,
    listIf: listContainersIf,
  }

  const createUserIf: CreateUserIf = createUser(
    useCreateUser,
    validateUserOrUndefined,
  )
  const deleteUserIf: DeleteUserIf = deleteUser(useDeleteUser)
  const listUsersIf: ListUsersIf = listUsers(
    useListUsers,
    validateUserListOrUndefined,
  )

  const userIf: UserIf = {
    create: createUserIf,
    delete: deleteUserIf,
    list: listUsersIf,
  }

  const createStyleIf: CreateStyleIf = createStyle(
    useCreateStyle,
    validateStyleOrUndefined,
  )
  const getStyleIf: GetStyleIf = getStyle(
    useGetStyle,
    validateStyleWithParentsAndChildrenOrUndefined,
  )
  const listStylesIf: ListStylesIf = {
    ...listStyles(useListStyles, validateStyleListOrUndefined),
    searchFieldIf,
  }
  const updateStyleIf: UpdateStyleIf = {
    ...updateStyle(useUpdateStyle, validateStyle),
    getLogin,
  }
  const selectStyleIf: SelectStyleIf = {
    create: createStyleIf,
    list: listStylesIf,
  }

  const getBeerIf: GetBeerIf = getBeer(useGetBeer, validateBeerOrUndefined)
  const listBeersIf: ListBeersIf = {
    ...listBeers(useListBeers, validateBeerList, validateBeerListOrUndefined),
    infiniteScroll,
  }

  const editBeerIf: EditBeerIf = {
    selectBreweryIf,
    selectStyleIf,
  }

  const createBeerIf: CreateBeerIf = {
    ...createBeer(useCreateBeer, validateBeerWithIds),
    editBeerIf,
  }
  const searchBeerIf: SearchBeerIf = {
    ...searchBeer(useSearchBeers, validateBeerList),
    searchFieldIf,
  }
  const updateBeerLoginIf: UpdateBeerLoginIf = {
    ...updateBeer(useUpdateBeer, validateBeerWithIds),
    editBeerIf,
    getLogin,
  }
  const selectBeerIf: SelectBeerIf = {
    create: createBeerIf,
    search: searchBeerIf,
  }

  const changePasswordIf: ChangePasswordIf = {
    ...changePassword(useChangePassword, usePasswordChangeResult),
    getLogin,
  }
  const loginIf: LoginIf = login(useLogin, useSaveLogin, validateLogin)
  const logoutIf: LogoutIf = logout(useLogout)

  const createLocationIf: CreateLocationIf = createLocation(
    useCreateLocation,
    validateLocation,
  )
  const getLocationIf: GetLocationIf = getLocation(
    useGetLocation,
    validateLocationOrUndefined,
  )
  const listLocationsIf: ListLocationsIf = {
    ...listLocations(
      useListLocations,
      validateLocationList,
      validateLocationListOrUndefined,
    ),
    infiniteScroll,
  }
  const searchLocationIf: SearchLocationIf = {
    ...searchLocation(useSearchLocations, validateLocationList),
    create: createLocationIf,
    searchFieldIf,
  }
  const updateLocationIf: UpdateLocationIf = {
    ...updateLocation(useUpdateLocation, validateLocation),
    getLogin,
  }

  const createStorageIf: CreateStorageIf = createStorage(
    useCreateStorage,
    validateCreatedStorage,
  )
  const getAnnualStorageStatsIf: GetAnnualStorageStatsIf =
    getAnnualStorageStats(
      useGetAnnualStorageStats,
      validateAnnualStorageStatsOrUndefined,
    )
  const getMonthlyStorageStatsIf: GetMonthlyStorageStatsIf =
    getMonthlyStorageStats(
      useGetMonthlyStorageStats,
      validateMonthlyStorageStatsOrUndefined,
    )
  const setSearch = createSetSearch(window.location.pathname, navigateIf)
  const storageStatsIf: StorageStatsIf = {
    annual: getAnnualStorageStatsIf,
    monthly: getMonthlyStorageStatsIf,
    setSearch: setSearch.stats,
    useUrlSearchParams,
  }
  const getStorageIf: GetStorageIf = getStorage(
    useGetStorage,
    validateStorageOrUndefined,
  )
  const deleteStorageIf: DeleteStorageIf = {
    ...deleteStorage(useDeleteStorage),
    getLogin,
  }
  const listStoragesIf: ListStoragesIf = {
    ...listStorages(useListStorages, validateStorageListOrUndefined),
    delete: deleteStorageIf,
  }
  const listStoragesByBeerIf: ListStoragesByIf = {
    ...listStoragesByBeer(
      useListStoragesByBeer,
      validateStorageListOrUndefined,
    ),
    delete: deleteStorageIf,
  }
  const listStoragesByBreweryIf: ListStoragesByIf = {
    ...listStoragesByBrewery(
      useListStoragesByBrewery,
      validateStorageListOrUndefined,
    ),
    delete: deleteStorageIf,
  }
  const listStoragesByStyleIf: ListStoragesByIf = {
    ...listStoragesByStyle(
      useListStoragesByStyle,
      validateStorageListOrUndefined,
    ),
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

  const getReviewIf: GetReviewIf = getReview(useGetReview, validateReview)
  const listReviewsFilterIf: ListFilterIf = {
    getUseDebounce,
    minTime,
    maxTime,
    setSearch: setSearch.reviewList,
    useUrlSearchParams,
  }
  const listReviewsIf: ListReviewsIf = {
    ...listReviews(
      useListReviews,
      validateJoinedReviewList,
      validateJoinedReviewListOrUndefined,
    ),
    infiniteScroll,
    filterIf: listReviewsFilterIf,
  }
  const updateReviewIf: UpdateReviewIf = {
    ...updateReview(useUpdateReview, validateReview),
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
    ...listReviewsByBeer(
      useListReviewsByBeer,
      validateJoinedReviewListOrUndefined,
    ),
    filterIf: listReviewsFilterIf,
    reviewIf,
  }
  const listReviewsByBreweryIf: ListReviewsByIf = {
    ...listReviewsByBrewery(
      useListReviewsByBrewery,
      validateJoinedReviewListOrUndefined,
    ),
    filterIf: listReviewsFilterIf,
    reviewIf,
  }
  const listReviewsByLocationIf: ListReviewsByIf = {
    ...listReviewsByLocation(
      useListReviewsByLocation,
      validateJoinedReviewListOrUndefined,
    ),
    filterIf: listReviewsFilterIf,
    reviewIf,
  }
  const listReviewsByStyleIf: ListReviewsByIf = {
    ...listReviewsByStyle(
      useListReviewsByStyle,
      validateJoinedReviewListOrUndefined,
    ),
    filterIf: listReviewsFilterIf,
    reviewIf,
  }
  const createReviewIf: CreateReviewIf = {
    ...createReview(useCreateReview, validateReviewOrUndefined),
    getCurrentDate: getDate,
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf,
  }

  const statsHookIf: StatsHookIf = stats(
    {
      annual: useGetAnnualStats,
      annualContainer: useGetAnnualContainerStats,
      brewery: useGetBreweryStats,
      breweryCountry: useGetBreweryCountryStats,
      container: useGetContainerStats,
      location: useGetLocationStats,
      overall: useGetOverallStats,
      rating: useGetRatingStats,
      style: useGetStyleStats,
    },
    {
      annualOrUndefined: validateAnnualStatsOrUndefined,
      annualContainer: validateAnnualContainerStats,
      annualContainerOrUndefined: validateAnnualContainerStatsOrUndefined,
      breweryCountry: validateBreweryCountryStats,
      breweryCountryOrUndefined: validateBreweryCountryStatsOrUndefined,
      brewery: validateBreweryStats,
      breweryOrUndefined: validateBreweryStatsOrUndefined,
      containerOrUndefined: validateContainerStatsOrUndefined,
      location: validateLocationStats,
      locationOrUndefined: validateLocationStatsOrUndefined,
      overallOrUndefined: validateOverallStatsOrUndefined,
      ratingOrUndefined: validateRatingStatsOrUndefined,
      styleOrUndefined: validateStyleStatsOrUndefined,
    },
  )
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

    navMenuIf: { useNavMenu },
    themeIf: { useTheme },

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

  return (
    <App
      linkComponent={Link}
      navigateIf={navigateIf}
      useUrlPathParams={useUrlPathParams}
      storeIf={storeIf}
    />
  )
}

export default RtkApp
