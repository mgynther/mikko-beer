import type {
  IdFilteredListReviewParams,
  ListReviewsByHookIf,
  UseListReviewsBy,
  ValidateJoinedReviewListOrUndefined,
} from './types'

const listReviewsByBrewery: (
  useListReviewsByBrewery: UseListReviewsBy,
  validateJoinedReviewListOrUndefined: ValidateJoinedReviewListOrUndefined,
) => ListReviewsByHookIf = (
  useListReviewsByBrewery,
  validateJoinedReviewListOrUndefined,
) => {
  const listReviewsByBreweryIf: ListReviewsByHookIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByBrewery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listReviewsByBreweryIf
}

export default listReviewsByBrewery
