import type {
  IdFilteredListReviewParams,
  ListFilterIf,
  ListReviewsByIf,
} from '../../core/review/types'
import { useListReviewsByStyleQuery } from '../../store/review/api'
import { validateJoinedReviewListOrUndefined } from '../../validation/review'

const listReviewsByStyle: (filterIf: ListFilterIf) => ListReviewsByIf = (
  filterIf: ListFilterIf,
) => {
  const listReviewsByStyleIf: ListReviewsByIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByStyleQuery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
    filterIf,
  }
  return listReviewsByStyleIf
}

export default listReviewsByStyle
