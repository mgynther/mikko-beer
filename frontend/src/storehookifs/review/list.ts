import type { ListReviewParams, ListReviewsIf } from "../../core/review/types"
import type { InfiniteScroll } from "../../core/types"
import { useLazyListReviewsQuery } from "../../store/review/api"

const listReviews: (infiniteScroll: InfiniteScroll) => ListReviewsIf = (
  infiniteScroll: InfiniteScroll
) => {
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
    },
    infiniteScroll
  }
  return listReviewsIf
}

export default listReviews
