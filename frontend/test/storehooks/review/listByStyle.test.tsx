import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import listReviewsByStyle from '../../../src/storehooks/review/listByStyle'
import type {
  IdFilteredListReviewParams,
  JoinedReviewList,
  UseListReviewsBy,
  ValidateJoinedReviewListOrUndefined,
} from '../../../src/storehooks/review/types'
import { buildJoinedReview } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedReviewList: JoinedReviewList = {
  reviews: [buildJoinedReview({ beerName: 'Validated beer' })],
  sorting: { order: 'time', direction: 'desc' },
}

const listed = { reviews: [{ id: 'listed' }], sorting: {} }

const params: IdFilteredListReviewParams = {
  filter: { minRating: 4, maxRating: 10, minTime: 1, maxTime: 2 },
  id: '846c2506-6fdd-4fc9-b6e6-41300bab9ed5',
  sorting: { order: 'rating', direction: 'asc' },
}

interface HelperProps {
  onList: (params: IdFilteredListReviewParams) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListReviewsBy = (
    listParams: IdFilteredListReviewParams,
  ) => {
    props.onList(listParams)
    return { data: listed, isLoading: false }
  }
  const validate: ValidateJoinedReviewListOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return validatedReviewList
  }
  const { reviews, isLoading } = listReviewsByStyle(
    useStoreList,
    validate,
  ).useList(params)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      {reviews?.reviews.map((review) => (
        <div key={review.id}>{review.beerName}</div>
      ))}
    </div>
  )
}

test('list reviews by style', () => {
  const onList = vitest.fn()
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper onList={onList} onValidate={onValidate} />,
  )

  expect(getByText(validatedReviewList.reviews[0].beerName)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onList).toHaveBeenCalledWith(params)
  expect(onValidate).toHaveBeenCalledWith(listed)
})
