import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import listReviews from './list'
import type {
  JoinedReviewList,
  ListReviewParams,
  UseListReviews,
  ValidateJoinedReviewList,
  ValidateJoinedReviewListOrUndefined,
} from './types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validators, for the reason given in
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

const params: ListReviewParams = {
  filter: { minRating: 4, maxRating: 10, minTime: 1, maxTime: 2 },
  pagination: { skip: 0, size: 10 },
  sorting: { order: 'time', direction: 'desc' },
}

interface HelperProps {
  data: unknown
  onList: (params: ListReviewParams) => void
  onListed: (list: JoinedReviewList) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListReviews = () => ({
    list: async (listParams: ListReviewParams): Promise<unknown> => {
      props.onList(listParams)
      return listed
    },
    data: props.data,
    isFetching: false,
    isUninitialized: props.data === undefined,
  })
  const validate: ValidateJoinedReviewList = (result: unknown) => {
    props.onValidate(result)
    return validatedReviewList
  }
  const validateOrUndefined: ValidateJoinedReviewListOrUndefined = (
    result: unknown,
  ) => (result === undefined ? undefined : validate(result))
  const { list, reviewList, isUninitialized } = listReviews(
    useStoreList,
    validate,
    validateOrUndefined,
  ).useList()
  return (
    <div>
      <div>{isUninitialized ? 'Uninitialized' : 'Initialized'}</div>
      {reviewList?.reviews.map((review) => (
        <div key={review.id}>{review.beerName}</div>
      ))}
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            props.onListed(await list(params))
          })()
        }}
      >
        List
      </button>
    </div>
  )
}

test('list reviews', async () => {
  const user = setupUser()
  const onList = vitest.fn()
  const onListed = vitest.fn()
  const onValidate = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper
      data={undefined}
      onList={onList}
      onListed={onListed}
      onValidate={onValidate}
    />,
  )
  expect(getByText('Uninitialized')).toBeDefined()

  await user.click(getByRole('button', { name: 'List' }))
  await waitFor(() => {
    expect(onListed).toHaveBeenCalledWith(validatedReviewList)
  })
  expect(onList).toHaveBeenCalledWith(params)
  expect(onValidate).toHaveBeenCalledWith(listed)
})

test('the review list the store holds is validated on the way out', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper
      data={listed}
      onList={() => undefined}
      onListed={() => undefined}
      onValidate={onValidate}
    />,
  )

  expect(getByText(validatedReviewList.reviews[0].beerName)).toBeDefined()
  expect(getByText('Initialized')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(listed)
})
