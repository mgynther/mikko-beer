import type { SelectBeerIf } from "../../core/beer/types"
import type {
  Review,
  ReviewContainerIf,
  UpdateReviewIf
} from "../../core/review/types"
import { useUpdateReviewMutation } from "../../store/review/api"

const updateReview: (
  selectBeerIf: SelectBeerIf,
  reviewContainerIf: ReviewContainerIf
) => UpdateReviewIf = (
  selectBeerIf: SelectBeerIf,
  reviewContainerIf: ReviewContainerIf
) => {
  const updateReviewIf: UpdateReviewIf = {
    useUpdate: () => {
      const [updateReview, { isLoading }] = useUpdateReviewMutation()
      return {
        update: async (review: Review) => {
          await updateReview(review)
        },
        isLoading
      }
    },
    selectBeerIf,
    reviewContainerIf
  }
  return updateReviewIf
}

export default updateReview
