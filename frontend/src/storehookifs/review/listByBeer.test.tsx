import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listReviewsByBeer from './listByBeer'
import type { JoinedReviewList } from '../../core/review/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  beerId: string
}

function Helper(props: HelperProps): React.JSX.Element {
  const listIf = listReviewsByBeer()
  const { reviews } = listIf.useList({
    id: props.beerId,
    sorting: { order: 'time', direction: 'desc' },
  })
  return (
    <div>
      {reviews?.reviews.map((review) => (
        <div key={review.id}>{review.beerName}</div>
      ))}
    </div>
  )
}

test('list reviews by beer', async () => {
  const beerId = '846c2506-6fdd-4fc9-b6e6-41300bab9ed5'
  const beerName = 'Test beer'

  const expectedResponse: JoinedReviewList = {
    reviews: [
      {
        id: '40b766e6-0356-4403-b902-3f771dcbf81f',
        additionalInfo: 'Test additional info',
        beerId,
        beerName,
        breweries: [
          {
            id: 'b709ecff-d6a0-4590-bb5f-508e14ac54f3',
            name: 'Test brewery',
          },
        ],
        container: {
          id: '3dc7cae4-a196-41ac-942c-ce9c1a6cd639',
          type: 'bottle',
          size: '0.33',
        },
        location: {
          id: '7aad6a35-cab0-45d3-b7c7-8842dba8bbfa',
          name: 'Test location',
        },
        rating: 8,
        styles: [
          {
            id: 'b355e97b-6fb4-4787-97d5-5852547b250b',
            name: 'Test style',
          },
        ],
        time: '2026-03-12T00:00:00.000Z',
      },
    ],
    sorting: {
      order: 'rating',
      direction: 'asc',
    },
  }

  addTestServerResponse<JoinedReviewList>({
    method: 'GET',
    pathname: `/api/v1/beer/${beerId}/review?order=time&direction=desc`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper beerId={beerId} />
    </Provider>,
  )
  await waitFor(() => {
    expect(getByText(beerName)).toBeDefined()
  })
})
