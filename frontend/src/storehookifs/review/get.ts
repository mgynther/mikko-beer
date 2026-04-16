import type { GetReviewIf, Review } from '../../core/review/types'
import { useLazyGetReviewQuery } from '../../store/review/api'
import { validateReview } from '../../validation/review'

const getReview: () => GetReviewIf = () => {
  const getReviewIf: GetReviewIf = {
    useGet: () => {
      const [getReview] = useLazyGetReviewQuery()
      return {
        get: async (reviewId: string): Promise<Review> => {
          const result = await getReview(reviewId).unwrap()
          return validateReview(result.review)
        },
      }
    },
  }
  return getReviewIf
}

export default getReview
