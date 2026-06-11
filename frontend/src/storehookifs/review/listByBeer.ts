import type {
  IdFilteredListReviewParams,
  ListReviewsByIf,
} from '../../core/review/types'
import { useListReviewsByBeerQuery } from '../../store/review/api'
import { validateJoinedReviewListOrUndefined } from '../../validation/review'

const listReviewsByBeer: () => ListReviewsByIf = () => {
  const listReviewsByBeerIf: ListReviewsByIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByBeerQuery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listReviewsByBeerIf
}

export default listReviewsByBeer
