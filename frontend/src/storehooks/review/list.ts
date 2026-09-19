import type {
  JoinedReviewList,
  ListReviewParams,
  ListReviewsHookIf,
  UseListReviews,
  ValidateJoinedReviewList,
  ValidateJoinedReviewListOrUndefined,
} from './types'

const listReviews: (
  useListReviews: UseListReviews,
  validateJoinedReviewList: ValidateJoinedReviewList,
  validateJoinedReviewListOrUndefined: ValidateJoinedReviewListOrUndefined,
) => ListReviewsHookIf = (
  useListReviews,
  validateJoinedReviewList,
  validateJoinedReviewListOrUndefined,
) => {
  const listReviewsIf: ListReviewsHookIf = {
    useList: () => {
      const { list, data, isFetching, isUninitialized } = useListReviews()
      return {
        reviewList: validateJoinedReviewListOrUndefined(data),
        list: async (params: ListReviewParams): Promise<JoinedReviewList> =>
          validateJoinedReviewList(await list(params)),
        isLoading: isFetching,
        isUninitialized,
      }
    },
  }
  return listReviewsIf
}

export default listReviews
