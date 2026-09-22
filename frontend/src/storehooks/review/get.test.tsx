import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import getReview from './get'
import type { Review, UseGetReview, ValidateReview } from './types'
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

const got = { review: { id: 'got', taste: 'Got taste' } }

const reviewId = 'd2ab3cd6-5e19-436e-9429-4d5f8863326f'

interface HelperProps {
  onGet: (reviewId: string) => void
  onGot: (review: Review) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreGet: UseGetReview = () => ({
    get: async (id: string): Promise<unknown> => {
      props.onGet(id)
      return got
    },
  })
  const validate: ValidateReview = (result: unknown) => {
    props.onValidate(result)
    return validatedReview
  }
  const { get } = getReview(useStoreGet, validate).useGet()
  return (
    <button
      type='button'
      onClick={() => {
        ;(async (): Promise<void> => {
          props.onGot(await get(reviewId))
        })().catch(createErrorLogger('get failed', console.error))
      }}
    >
      Get
    </button>
  )
}

test('get review', async () => {
  const user = setupUser()
  const onGet = vitest.fn()
  const onGot = vitest.fn()
  const onValidate = vitest.fn()

  const { getByRole } = render(
    <Helper onGet={onGet} onGot={onGot} onValidate={onValidate} />,
  )

  await user.click(getByRole('button', { name: 'Get' }))
  await waitFor(() => {
    expect(onGot).toHaveBeenCalledWith(validatedReview)
  })
  expect(onGet).toHaveBeenCalledWith(reviewId)
  // The envelope is unwrapped before the validator sees the review.
  expect(onValidate).toHaveBeenCalledWith(got.review)
})
