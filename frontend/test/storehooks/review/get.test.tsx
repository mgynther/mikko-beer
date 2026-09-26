import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import getReview from '../../../src/storehooks/review/get'
import type {
  Review,
  UseGetReview,
  ValidateReview,
} from '../../../src/storehooks/review/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildReview } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedReview = buildReview()

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
