import type { GetReviewIf } from "../../core/review/types"
import { useLazyGetReviewQuery } from "../../store/review/api"

const getReview: () => GetReviewIf = () => {
  const getReviewIf: GetReviewIf = {
    useGet: () => {
      const [getReview] = useLazyGetReviewQuery()
      return {
        get: async (reviewId: string) =>
          (await getReview(reviewId).unwrap()).review
      }
    }
  }
  return getReviewIf
}

export default getReview
