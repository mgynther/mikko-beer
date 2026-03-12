import type { SelectBeerIf } from "../../core/beer/types"
import type { SearchLocationIf } from "../../core/location/types"
import type {
  Review,
  ReviewContainerIf,
  UpdateReviewIf
} from "../../core/review/types"
import { useUpdateReviewMutation } from "../../store/review/api"
import { validateReview } from "../../validation/review"

const updateReview: (
  searchLocationIf: SearchLocationIf,
  selectBeerIf: SelectBeerIf,
  reviewContainerIf: ReviewContainerIf
) => UpdateReviewIf = (
  searchLocationIf: SearchLocationIf,
  selectBeerIf: SelectBeerIf,
  reviewContainerIf: ReviewContainerIf
) => {
  const updateReviewIf: UpdateReviewIf = {
    useUpdate: () => {
      const [updateReview, { isLoading }] = useUpdateReviewMutation()
      return {
        update: async (review: Review): Promise<void> => {
          const result = await updateReview(review).unwrap()
          validateReview(result.review)
        },
        isLoading
      }
    },
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf
  }
  return updateReviewIf
}

export default updateReview
