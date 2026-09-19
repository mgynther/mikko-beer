import type {
  GetReviewHookIf,
  Review,
  UseGetReview,
  ValidateReview,
} from './types'
import { unwrapMember } from '../envelope'

const getReview: (
  useGetReview: UseGetReview,
  validateReview: ValidateReview,
) => GetReviewHookIf = (useGetReview, validateReview) => {
  const getReviewIf: GetReviewHookIf = {
    useGet: () => {
      const { get } = useGetReview()
      return {
        get: async (reviewId: string): Promise<Review> => {
          const result = await get(reviewId)
          return validateReview(unwrapMember(result, 'review'))
        },
      }
    },
  }
  return getReviewIf
}

export default getReview
