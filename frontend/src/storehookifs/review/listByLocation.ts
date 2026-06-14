import type {
  IdFilteredListReviewParams,
  ListFilterIf,
  ListReviewsByIf,
} from '../../core/review/types'
import { useListReviewsByLocationQuery } from '../../store/review/api'
import { validateJoinedReviewListOrUndefined } from '../../validation/review'

const listReviewsByLocation: (filterIf: ListFilterIf) => ListReviewsByIf = (
  filterIf: ListFilterIf,
) => {
  const listReviewsByLocationIf: ListReviewsByIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByLocationQuery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
    filterIf,
  }
  return listReviewsByLocationIf
}

export default listReviewsByLocation
