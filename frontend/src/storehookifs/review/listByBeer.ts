import type {
  IdFilteredListReviewParams,
  ListReviewsByHookIf,
} from '../../core/review/types'
import { useListReviewsByBeerQuery } from '../../store/review/api'
import { validateJoinedReviewListOrUndefined } from '../../validation/review'

const listReviewsByBeer: () => ListReviewsByHookIf = () => {
  const listReviewsByBeerIf: ListReviewsByHookIf = {
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
