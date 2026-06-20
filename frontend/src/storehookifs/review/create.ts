import type {
  CreateReviewHookIf,
  ReviewRequestWrapper,
} from '../../core/review/types'
import { useCreateReviewMutation } from '../../store/review/api'
import { validateReviewOrUndefined } from '../../validation/review'

const createReview: () => CreateReviewHookIf = () => {
  const createReviewIf: CreateReviewHookIf = {
    useCreate: () => {
      const [createReview, { isLoading, isSuccess, data }] =
        useCreateReviewMutation()
      return {
        create: async (request: ReviewRequestWrapper): Promise<void> => {
          await createReview(request)
        },
        isLoading,
        isSuccess,
        review: validateReviewOrUndefined(data?.review),
      }
    },
  }
  return createReviewIf
}

export default createReview
