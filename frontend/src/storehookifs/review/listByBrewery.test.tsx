import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listReviewsByBrewery from './listByBrewery'
import type { JoinedReviewList } from '../../core/review/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  breweryId: string
}

function Helper(props: HelperProps): React.JSX.Element {
  const listIf = listReviewsByBrewery()
  const { reviews } = listIf.useList({
    id: props.breweryId,
    sorting: { order: 'time', direction: 'desc' }
  })
  return (
    <div>
      {reviews?.reviews.map(review =>
        <div key={review.id}>{review.breweries[0].name}</div>
      )}
    </div>
  )
}

test('list reviews by brewery', async () => {
  const breweryId = '90fae3ce-7331-4bb4-b3cd-026d648c69bf'
  const breweryName = 'Test brewery'

  const expectedResponse: JoinedReviewList = {
    reviews: [
      {
        id: '6d7c277e-9f6a-4860-8db4-7d956e7174e4',
        additionalInfo: 'Test additional info',
        beerId: '927f8ebe-934f-46b2-a6a1-498cc42bdcf4',
        beerName: 'Test beer',
        breweries: [
          {
            id: breweryId,
            name: breweryName,
          }
        ],
        container: {
          id: '06a2ec4f-ebf4-4ab6-ab41-1f14c54675e9',
          type: 'bottle',
          size: '0.33'
        },
        location: {
          id: '0dc8bac5-bc37-4a34-873a-8eba66b8e115',
          name: 'Test location'
        },
        rating: 8,
        styles: [
          {
            id: 'a8e33055-5509-4c53-bd03-29ba1488f15e',
            name: 'Test style'
          }
        ],
        time: '2026-03-12T00:00:00.000Z'
      }
    ]
  }

  addTestServerResponse<JoinedReviewList>({
    method: 'GET',
    pathname:
      `/api/v1/brewery/${breweryId}/review?order=time&direction=desc`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper breweryId={breweryId} />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(breweryName)).toBeDefined()
  })
})
