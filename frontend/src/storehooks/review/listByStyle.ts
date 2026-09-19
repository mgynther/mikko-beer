import type {
  IdFilteredListReviewParams,
  ListReviewsByHookIf,
  UseListReviewsBy,
  ValidateJoinedReviewListOrUndefined,
} from './types'

const listReviewsByStyle: (
  useListReviewsByStyle: UseListReviewsBy,
  validateJoinedReviewListOrUndefined: ValidateJoinedReviewListOrUndefined,
) => ListReviewsByHookIf = (
  useListReviewsByStyle,
  validateJoinedReviewListOrUndefined,
) => {
  const listReviewsByStyleIf: ListReviewsByHookIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByStyle(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listReviewsByStyleIf
}

export default listReviewsByStyle
