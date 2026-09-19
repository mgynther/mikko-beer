import type {
  Review,
  UpdateReviewHookIf,
  UseUpdateReview,
  ValidateReview,
} from './types'
import { unwrapMember } from '../envelope'

const updateReview: (
  useUpdateReview: UseUpdateReview,
  validateReview: ValidateReview,
) => UpdateReviewHookIf = (useUpdateReview, validateReview) => {
  const updateReviewIf: UpdateReviewHookIf = {
    useUpdate: () => {
      const { update, isLoading } = useUpdateReview()
      return {
        update: async (review: Review): Promise<void> => {
          const result = await update(review)
          validateReview(unwrapMember(result, 'review'))
        },
        isLoading,
      }
    },
  }
  return updateReviewIf
}

export default updateReview
