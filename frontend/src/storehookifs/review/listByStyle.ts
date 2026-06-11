import type {
  IdFilteredListReviewParams,
  ListReviewsByIf,
} from '../../core/review/types'
import { useListReviewsByStyleQuery } from '../../store/review/api'
import { validateJoinedReviewListOrUndefined } from '../../validation/review'

const listReviewsByStyle: () => ListReviewsByIf = () => {
  const listReviewsByStyleIf: ListReviewsByIf = {
    useList: (params: IdFilteredListReviewParams) => {
      const { data, isLoading } = useListReviewsByStyleQuery(params)
      return {
        reviews: validateJoinedReviewListOrUndefined(data),
        isLoading,
      }
    },
  }
  return listReviewsByStyleIf
}

export default listReviewsByStyle
