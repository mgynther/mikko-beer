import { test } from '../../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDefined,
} from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import updateReview from '../../../src/storehooks/review/update'
import type {
  Review,
  UseUpdateReview,
  ValidateReview,
} from '../../../src/storehooks/review/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildReview } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedReview = buildReview()

const updated = { review: { id: 'updated', taste: 'Updated taste' } }

const review = buildReview()

interface HelperProps {
  onUpdate: (review: Review) => void
  onUpdated: () => void
  onError: () => void
  validate: ValidateReview
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreUpdate: UseUpdateReview = () => ({
    update: async (updatedReview: Review): Promise<unknown> => {
      props.onUpdate(updatedReview)
      return updated
    },
    isLoading: false,
  })
  const { update, isLoading } = updateReview(
    useStoreUpdate,
    props.validate,
  ).useUpdate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            try {
              await update(review)
              props.onUpdated()
            } catch {
              props.onError()
            }
          })().catch(createErrorLogger('update failed', console.error))
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update review', async () => {
  const user = setupUser()
  const onUpdate = mockFunction()
  const onUpdated = mockFunction()
  const onValidate = mockFunction()
  const validate: ValidateReview = (result: unknown) => {
    onValidate(result)
    return validatedReview
  }

  const { getByRole, getByText } = render(
    <Helper
      onUpdate={onUpdate}
      onUpdated={onUpdated}
      onError={() => undefined}
      validate={validate}
    />,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    assertCalled(onUpdated)
  })
  assertDefined(getByText('Not loading'))
  assertCalledWith(onUpdate, [review])
  assertCalledWith(onValidate, [updated.review])
})

test('fail to update review that does not validate', async () => {
  const user = setupUser()
  const onUpdated = mockFunction()
  const onError = mockFunction()

  const { getByRole } = render(
    <Helper
      onUpdate={() => undefined}
      onUpdated={onUpdated}
      onError={onError}
      validate={() => {
        throw Error('Could not validate data')
      }}
    />,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  // A response that does not validate must not be reported as a successful
  // update: the throw propagates out of update and what follows it is never
  // reached.
  await waitFor(() => {
    assertCalled(onError)
  })
  assertCallCount(onUpdated, 0)
})
