import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import createReview from '../../../src/storehooks/review/create'
import type {
  ReviewRequestWrapper,
  UseCreateReview,
  ValidateReviewOrUndefined,
} from '../../../src/storehooks/review/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildReview } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedReview = buildReview({ taste: 'Validated taste' })

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
  const onCreate = mockFunction<[request: ReviewRequestWrapper]>()
  const onValidate = mockFunction<[result: unknown]>()

  const { getByRole, getByText } = render(
    <Helper
      data={created}
      isSuccess={true}
      onCreate={onCreate}
      onValidate={onValidate}
    />,
  )
  assertDefined(getByText(validatedReview.taste))
  assertDefined(getByText('Succeeded'))

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertCalledWith(onCreate, [request])
  })
  // The envelope is unwrapped before the validator sees the review.
  assertCalledWith(onValidate, [created.review])
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

  assertDefined(getByText('No review'))
  assertDefined(getByText('Not succeeded'))
})
