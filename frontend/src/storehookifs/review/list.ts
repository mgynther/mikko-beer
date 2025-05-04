import type { ListReviewParams, ListReviewsIf } from "../../core/review/types"
import type { InfiniteScroll } from "../../core/types"
import { useLazyListReviewsQuery } from "../../store/review/api"
import { validateJoinedReviewListOrUndefined } from "../../validation/review"

const listReviews: (infiniteScroll: InfiniteScroll) => ListReviewsIf = (
  infiniteScroll: InfiniteScroll
) => {
  const listReviewsIf: ListReviewsIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized }] =
        useLazyListReviewsQuery()
      return {
        reviewList: validateJoinedReviewListOrUndefined(data),
        list: async (params: ListReviewParams) => {
          const result = await trigger(params).unwrap()
          return validateJoinedReviewListOrUndefined(result)
        },
        isLoading: isFetching,
        isUninitialized
      }
    },
    infiniteScroll
  }
  return listReviewsIf
}

export default listReviews
