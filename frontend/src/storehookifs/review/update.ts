import type { Review, UpdateReviewHookIf } from '../../core/review/types'
import { useUpdateReviewMutation } from '../../store/review/api'
import { validateReview } from '../../validation/review'

const updateReview: () => UpdateReviewHookIf = () => {
  const updateReviewIf: UpdateReviewHookIf = {
    useUpdate: () => {
      const [updateReview, { isLoading }] = useUpdateReviewMutation()
      return {
        update: async (review: Review): Promise<void> => {
          const result = await updateReview(review).unwrap()
          validateReview(result.review)
        },
        isLoading,
      }
    },
  }
  return updateReviewIf
}

export default updateReview
