import type {
  IdFilteredListReviewParams,
  ListReviewsByIf,
} from '../../core/review/types'
import { useListReviewsByLocationQuery } from '../../store/review/api'
import { validateJoinedReviewListOrUndefined } from '../../validation/review'

const listReviewsByLocation: () => ListReviewsByIf = () => {
  const listReviewsByLocationIf: ListReviewsByIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByLocationQuery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listReviewsByLocationIf
}

export default listReviewsByLocation
