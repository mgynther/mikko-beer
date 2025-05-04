import type {
  FilteredListReviewParams,
  ListReviewsByIf
} from "../../core/review/types"
import { useListReviewsByBreweryQuery } from "../../store/review/api"
import { validateJoinedReviewListOrUndefined } from "../../validation/review"

const listReviewsByBrewery: () => ListReviewsByIf = () => {
  const listReviewsByBreweryIf: ListReviewsByIf = {
    useList: (params: FilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByBreweryQuery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading
      }
    }
  }
  return listReviewsByBreweryIf
}

export default listReviewsByBrewery
