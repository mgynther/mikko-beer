import type {
  IdFilteredListReviewParams,
  ListFilterIf,
  ListReviewsByIf,
} from '../../core/review/types'
import { useListReviewsByBreweryQuery } from '../../store/review/api'
import { validateJoinedReviewListOrUndefined } from '../../validation/review'

const listReviewsByBrewery: (filterIf: ListFilterIf) => ListReviewsByIf = (
  filterIf: ListFilterIf,
) => {
  const listReviewsByBreweryIf: ListReviewsByIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByBreweryQuery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
    filterIf,
  }
  return listReviewsByBreweryIf
}

export default listReviewsByBrewery
