import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import updateReview from './update'
import type { Review, UseUpdateReview, ValidateReview } from './types'
import { setupUser } from '../../../test-util/user-event'

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

const updated = { review: { id: 'updated', taste: 'Updated taste' } }

const review: Review = {
  id: '0b1c2d3e-4f50-4617-8293-a4b5c6d7e8f9',
  additionalInfo: 'Test additional info',
  beer: '1c2d3e4f-5061-4728-93a4-b5c6d7e8f901',
  container: '2d3e4f50-6172-4839-a4b5-c6d7e8f90112',
  location: '3e4f5061-7283-494a-b5c6-d7e8f9011223',
  rating: 9,
  smell: 'Test smell',
  taste: 'Test taste',
  time: '2026-03-12T00:00:00.000Z',
}

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
          void (async (): Promise<void> => {
            try {
              await update(review)
              props.onUpdated()
            } catch {
              props.onError()
            }
          })()
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update review', async () => {
  const user = setupUser()
  const onUpdate = vitest.fn()
  const onUpdated = vitest.fn()
  const onValidate = vitest.fn()
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
    expect(onUpdated).toHaveBeenCalled()
  })
  expect(getByText('Not loading')).toBeDefined()
  expect(onUpdate).toHaveBeenCalledWith(review)
  expect(onValidate).toHaveBeenCalledWith(updated.review)
})

test('fail to update review that does not validate', async () => {
  const user = setupUser()
  const onUpdated = vitest.fn()
  const onError = vitest.fn()

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
    expect(onError).toHaveBeenCalled()
  })
  expect(onUpdated).not.toHaveBeenCalled()
})
