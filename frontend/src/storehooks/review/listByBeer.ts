import type {
  IdFilteredListReviewParams,
  ListReviewsByHookIf,
  UseListReviewsBy,
  ValidateJoinedReviewListOrUndefined,
} from './types'

const listReviewsByBeer: (
  useListReviewsByBeer: UseListReviewsBy,
  validateJoinedReviewListOrUndefined: ValidateJoinedReviewListOrUndefined,
) => ListReviewsByHookIf = (
  useListReviewsByBeer,
  validateJoinedReviewListOrUndefined,
) => {
  const listReviewsByBeerIf: ListReviewsByHookIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByBeer(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listReviewsByBeerIf
}

export default listReviewsByBeer
