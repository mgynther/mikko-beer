import type {
  IdFilteredListReviewParams,
  ListReviewsByHookIf,
  UseListReviewsBy,
  ValidateJoinedReviewListOrUndefined,
} from './types'

const listReviewsByLocation: (
  useListReviewsByLocation: UseListReviewsBy,
  validateJoinedReviewListOrUndefined: ValidateJoinedReviewListOrUndefined,
) => ListReviewsByHookIf = (
  useListReviewsByLocation,
  validateJoinedReviewListOrUndefined,
) => {
  const listReviewsByLocationIf: ListReviewsByHookIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByLocation(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listReviewsByLocationIf
}

export default listReviewsByLocation
