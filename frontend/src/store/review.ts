import type {
  IdFilteredListReviewParams,
  ListReviewParams,
  ReviewRequestWrapper,
  UpdateReviewRequest,
} from './internal/review/requests'
import {
  useCreateReviewMutation,
  useLazyGetReviewQuery,
  useLazyListReviewsQuery,
  useListReviewsByBeerQuery,
  useListReviewsByBreweryQuery,
  useListReviewsByLocationQuery,
  useListReviewsByStyleQuery,
  useUpdateReviewMutation,
} from './internal/review/api'

// The public surface of the review endpoints. See store/beer.ts for why every
// result is built here rather than handed on as the query hook returned it.
export interface ListReviewsByResult {
  data: unknown
  isLoading: boolean
}

export interface GetReviewResult {
  get: (reviewId: string) => Promise<unknown>
}

export interface ListReviewsResult {
  list: (params: ListReviewParams) => Promise<unknown>
  data: unknown
  isFetching: boolean
  isUninitialized: boolean
}

// Creating a review does not unwrap its response: the form reads the outcome
// from isSuccess and the created review from data.
export interface CreateReviewResult {
  create: (request: ReviewRequestWrapper) => Promise<void>
  data: unknown
  isLoading: boolean
  isSuccess: boolean
}

export interface UpdateReviewResult {
  update: (review: UpdateReviewRequest) => Promise<unknown>
  isLoading: boolean
}

export function useGetReview(): GetReviewResult {
  const [trigger] = useLazyGetReviewQuery()
  return {
    get: async (reviewId: string): Promise<unknown> =>
      await trigger(reviewId).unwrap(),
  }
}

export function useListReviews(): ListReviewsResult {
  const [trigger, { data, isFetching, isUninitialized }] =
    useLazyListReviewsQuery()
  return {
    list: async (params: ListReviewParams): Promise<unknown> =>
      await trigger(params).unwrap(),
    data,
    isFetching,
    isUninitialized,
  }
}

export function useListReviewsByBeer(
  params: IdFilteredListReviewParams,
): ListReviewsByResult {
  const { data, isLoading } = useListReviewsByBeerQuery(params)
  return {
    data,
    isLoading,
  }
}

export function useListReviewsByBrewery(
  params: IdFilteredListReviewParams,
): ListReviewsByResult {
  const { data, isLoading } = useListReviewsByBreweryQuery(params)
  return {
    data,
    isLoading,
  }
}

export function useListReviewsByLocation(
  params: IdFilteredListReviewParams,
): ListReviewsByResult {
  const { data, isLoading } = useListReviewsByLocationQuery(params)
  return {
    data,
    isLoading,
  }
}

export function useListReviewsByStyle(
  params: IdFilteredListReviewParams,
): ListReviewsByResult {
  const { data, isLoading } = useListReviewsByStyleQuery(params)
  return {
    data,
    isLoading,
  }
}

export function useCreateReview(): CreateReviewResult {
  const [createReview, { data, isLoading, isSuccess }] =
    useCreateReviewMutation()
  return {
    create: async (request: ReviewRequestWrapper): Promise<void> => {
      await createReview(request)
    },
    data,
    isLoading,
    isSuccess,
  }
}

export function useUpdateReview(): UpdateReviewResult {
  const [updateReview, { isLoading }] = useUpdateReviewMutation()
  return {
    update: async (review: UpdateReviewRequest): Promise<unknown> =>
      await updateReview(review).unwrap(),
    isLoading,
  }
}
