import type {
  IdFilteredListReviewParams,
  ListFilterIf,
  ListReviewsByIf,
} from '../../core/review/types'
import { useListReviewsByBeerQuery } from '../../store/review/api'
import { validateJoinedReviewListOrUndefined } from '../../validation/review'

const listReviewsByBeer: (filterIf: ListFilterIf) => ListReviewsByIf = (
  filterIf: ListFilterIf,
) => {
  const listReviewsByBeerIf: ListReviewsByIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByBeerQuery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
    filterIf,
  }
  return listReviewsByBeerIf
}

export default listReviewsByBeer
