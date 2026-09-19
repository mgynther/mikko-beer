import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import listReviewsByLocation from './listByLocation'
import type {
  IdFilteredListReviewParams,
  JoinedReviewList,
  UseListReviewsBy,
  ValidateJoinedReviewListOrUndefined,
} from './types'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedReviewList: JoinedReviewList = {
  reviews: [
    {
      id: '6a5b4c3d-2e1f-4098-8776-5e4d3c2b1a09',
      additionalInfo: 'Validated additional info',
      beerId: '7b6c5d4e-3f20-4189-8877-6f5e4d3c2b1a',
      beerName: 'Validated beer',
      breweries: [],
      container: {
        id: '8c7d6e5f-4031-429a-9988-7a6b5c4d3e2f',
        type: 'bottle',
        size: '0.33',
      },
      location: undefined,
      rating: 6,
      styles: [],
      time: '2025-01-01T00:00:00.000Z',
    },
  ],
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
  const { reviews, isLoading } = listReviewsByLocation(
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

test('list reviews by location', () => {
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
