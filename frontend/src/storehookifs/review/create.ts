import type { SelectBeerIf } from "../../core/beer/types"
import type { SearchLocationIf } from "../../core/location/types"
import type {
  CreateReviewIf,
  ReviewContainerIf,
  ReviewRequestWrapper
} from "../../core/review/types"
import { useCreateReviewMutation } from "../../store/review/api"

type GetCurrentDate = () => Date

const createReview: (
  getCurrentDate: GetCurrentDate,
  searchLocationIf: SearchLocationIf,
  selectBeerIf: SelectBeerIf,
  reviewContainerIf: ReviewContainerIf
) => CreateReviewIf = (
  getCurrentDate: GetCurrentDate,
  searchLocationIf: SearchLocationIf,
  selectBeerIf: SelectBeerIf,
  reviewContainerIf: ReviewContainerIf
) => {
  const createReviewIf: CreateReviewIf = {
    useCreate: () => {
      const [ createReview, { isLoading, isSuccess, data }] =
        useCreateReviewMutation()
      return {
        create: async (request: ReviewRequestWrapper) => {
          await createReview(request)
        },
        isLoading,
        isSuccess,
        review: data?.review
      }
    },
    getCurrentDate,
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf
  }
  return createReviewIf
}

export default createReview
