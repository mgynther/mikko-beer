import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import createReview from './create'
import type {
  Review,
  ReviewRequestWrapper,
  UseCreateReview,
  ValidateReviewOrUndefined,
} from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedReview: Review = {
  id: '9f8e7d6c-5b4a-4392-8170-6f5e4d3c2b1a',
  additionalInfo: 'Validated additional info',
  beer: '1f2e3d4c-5b6a-4798-8071-2f3e4d5c6b7a',
  container: '2e3d4c5b-6a79-4881-9062-3e4d5c6b7a89',
  location: '3d4c5b6a-7988-4172-8053-4d5c6b7a8998',
  rating: 7,
  smell: 'Validated smell',
  taste: 'Validated taste',
  time: '2025-01-01T00:00:00.000Z',
}

const created = { review: { id: 'created', taste: 'Created taste' } }

const request: ReviewRequestWrapper = {
  body: {
    additionalInfo: 'additional',
    beer: '71f4f237-42e7-4738-b015-3ebc09bdd99f',
    container: '44b0ee1a-fedd-4ebc-b301-f369fdf22d5b',
    location: '0a7fed33-db58-441d-8e28-33d00d2c1a9d',
    rating: 10,
    smell: 'Citrusy, pine',
    taste: 'Bitter, clean, delicious',
    time: '2025-10-10T12:00:00.000Z',
  },
  storageId: '27ca65f2-bd6b-492e-81a2-57768cf0c23c',
}

interface HelperProps {
  data: unknown
  isSuccess: boolean
  onCreate: (request: ReviewRequestWrapper) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateReview = () => ({
    create: async (wrapper: ReviewRequestWrapper): Promise<void> => {
      props.onCreate(wrapper)
    },
    data: props.data,
    isLoading: false,
    isSuccess: props.isSuccess,
  })
  const validate: ValidateReviewOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedReview
  }
  const { create, review, isLoading, isSuccess } = createReview(
    useStoreCreate,
    validate,
  ).useCreate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{isSuccess ? 'Succeeded' : 'Not succeeded'}</div>
      <div>{review === undefined ? 'No review' : review.taste}</div>
      <button
        type='button'
        onClick={() => {
          create(request).catch(
            createErrorLogger('create failed', console.error),
          )
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create review', async () => {
  const user = setupUser()
  const onCreate = vitest.fn()
  const onValidate = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper
      data={created}
      isSuccess={true}
      onCreate={onCreate}
      onValidate={onValidate}
    />,
  )
  expect(getByText(validatedReview.taste)).toBeDefined()
  expect(getByText('Succeeded')).toBeDefined()

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onCreate).toHaveBeenCalledWith(request)
  })
  // The envelope is unwrapped before the validator sees the review.
  expect(onValidate).toHaveBeenCalledWith(created.review)
})

test('a review that has not been created is undefined', () => {
  const { getByText } = render(
    <Helper
      data={undefined}
      isSuccess={false}
      onCreate={() => undefined}
      onValidate={() => undefined}
    />,
  )

  expect(getByText('No review')).toBeDefined()
  expect(getByText('Not succeeded')).toBeDefined()
})
