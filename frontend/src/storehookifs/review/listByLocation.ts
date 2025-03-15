import type {
  FilteredListReviewParams,
  ListReviewsByIf
} from "../../core/review/types"
import { useListReviewsByLocationQuery } from "../../store/review/api"

const listReviewsByLocation: () => ListReviewsByIf = () => {
  const listReviewsByLocationIf: ListReviewsByIf = {
    useList: (params: FilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByLocationQuery(params)
      return {
        reviews: data,
        isLoading
      }
    }
  }
  return listReviewsByLocationIf
}

export default listReviewsByLocation
