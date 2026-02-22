import type { GetReviewIf, Review } from "../../core/review/types"
import { useLazyGetReviewQuery } from "../../store/review/api"
import { validateReviewOrUndefined } from "../../validation/review"

const getReview: () => GetReviewIf = () => {
  const getReviewIf: GetReviewIf = {
    useGet: () => {
      const [getReview] = useLazyGetReviewQuery()
      return {
        get: async (reviewId: string): Promise<Review | undefined> => {
          const result = await getReview(reviewId).unwrap()
          return validateReviewOrUndefined(result.review)
        }
      }
    }
  }
  return getReviewIf
}

export default getReview
