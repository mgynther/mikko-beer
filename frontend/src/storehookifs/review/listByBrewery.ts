import type {
  IdFilteredListReviewParams,
  ListReviewsByHookIf,
} from '../../core/review/types'
import { useListReviewsByBreweryQuery } from '../../store/review/api'
import { validateJoinedReviewListOrUndefined } from '../../validation/review'

const listReviewsByBrewery: () => ListReviewsByHookIf = () => {
  const listReviewsByBreweryIf: ListReviewsByHookIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByBreweryQuery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listReviewsByBreweryIf
}

export default listReviewsByBrewery
