import React, { useId } from 'react'

import { activate, selectActiveSearch } from './store/search/reducer'
import { useDispatch, useSelector } from './react-redux-wrapper'
import type {
  CreateUserRequest,
  UserIf
} from './core/user/types'

import './App.css'

import App from './App.tsx'

import {
  useCreateContainerMutation,
  useListContainersQuery,
  useUpdateContainerMutation
} from './store/container/api'
import {
  useChangePasswordMutation,
  useLoginMutation,
  useLogoutMutation,
} from './store/login/api'
import { selectLogin, selectPasswordChangeResult } from './store/login/reducer'
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
  LogoutIf,
  LogoutParams,
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
  infiniteScroll,
  useDebounce
} from './components/util'
import type { StoreIf } from './store/storeIf'

function RtkApp (): React.JSX.Element {
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
    },
    infiniteScroll
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
    },
    infiniteScroll
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

  const logoutIf: LogoutIf = {
    useLogout: () => {
      const [logout] = useLogoutMutation()
      return {
        logout: async (params: LogoutParams) => {
          await logout(params)
        }
      }
    }
  }

  const getLogin: GetLogin = () => {
    const login: Login = useSelector(selectLogin)
    return login
  }

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

  const storeIf: StoreIf = {
    getBeerIf,
    listBeersIf,
    searchBeerIf,
    selectBeerIf,
    updateBeerIf,

    getBreweryIf,
    listBreweriesIf,
    searchBreweryIf,
    updateBreweryIf,

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
    <App storeIf={storeIf}/>
  )
}

export default RtkApp
