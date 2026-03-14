import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import getReview from './get'
import type { Review } from '../../core/review/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

interface HelperProps {
  reviewId: string
  handleResponse: (review: Review) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const getIf = getReview()
  const { get } = getIf.useGet()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      const response = await get(props.reviewId)
      props.handleResponse(response)
    }
    void doHandle()
  }
  return (
    <Button onClick={handleClick} text='Test' />
  )
}

test('get review', async () => {
  const user = userEvent.setup()

  const expectedResponse: { review: Review } = {
    review: {
      id: 'd2ab3cd6-5e19-436e-9429-4d5f8863326f',
      additionalInfo: 'Test additional info',
      beer: '4f2abc6c-a56e-45ff-8a3f-0605b74af863',
      container: '4206270a-7abc-4fd3-994b-c8a8f6906b62',
      location: 'cdcad6a5-97f1-499b-98a7-c72203e66892',
      rating: 8,
      smell: 'Test smell',
      taste: 'Test taste',
      time: '2026-03-12T00:00:00.000Z'
    }
  }

  addTestServerResponse<{ review: Review }>({
    method: 'GET',
    pathname: `/api/v1/review/${expectedResponse.review.id}`,
    response: expectedResponse,
    status: 200
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper reviewId={expectedResponse.review.id}
        handleResponse={handler} />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith(expectedResponse.review)
  })
})
