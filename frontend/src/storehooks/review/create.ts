import type {
  CreateReviewHookIf,
  ReviewRequestWrapper,
  UseCreateReview,
  ValidateReviewOrUndefined,
} from './types'
import { unwrapMemberOrUndefined } from '../envelope'

const createReview: (
  useCreateReview: UseCreateReview,
  validateReviewOrUndefined: ValidateReviewOrUndefined,
) => CreateReviewHookIf = (useCreateReview, validateReviewOrUndefined) => {
  const createReviewIf: CreateReviewHookIf = {
    useCreate: () => {
      const { create, data, isLoading, isSuccess } = useCreateReview()
      return {
        create: async (request: ReviewRequestWrapper): Promise<void> => {
          await create(request)
        },
        isLoading,
        isSuccess,
        review: validateReviewOrUndefined(
          unwrapMemberOrUndefined(data, 'review'),
        ),
      }
    },
  }
  return createReviewIf
}

export default createReview
