import type {
  JoinedReviewList,
  ListReviewParams,
  ListReviewsHookIf,
} from '../../core/review/types'
import { useLazyListReviewsQuery } from '../../store/review/api'
import {
  validateJoinedReviewList,
  validateJoinedReviewListOrUndefined,
} from '../../validation/review'

const listReviews: () => ListReviewsHookIf = () => {
  const listReviewsIf: ListReviewsHookIf = {
    useList: () => {
      const [trigger, { data, isFetching, isUninitialized }] =
        useLazyListReviewsQuery()
      return {
        reviewList: validateJoinedReviewListOrUndefined(data),
        list: async (params: ListReviewParams): Promise<JoinedReviewList> => {
          const result = await trigger(params).unwrap()
          return validateJoinedReviewList(result)
        },
        isLoading: isFetching,
        isUninitialized,
      }
    },
  }
  return listReviewsIf
}

export default listReviews
