import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listReviewsByLocation from './listByLocation'
import type { JoinedReviewList } from '../../core/review/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  locationId: string
}

function Helper(props: HelperProps): React.JSX.Element {
  const listIf = listReviewsByLocation()
  const { reviews } = listIf.useList({
    id: props.locationId,
    sorting: { order: 'time', direction: 'desc' },
  })
  return (
    <div>
      {reviews?.reviews.map((review) => (
        <div key={review.id}>{review.location?.name}</div>
      ))}
    </div>
  )
}

test('list reviews by location', async () => {
  const locationId = '9acc86e4-fc44-42c9-b1e6-b22972fe3733'
  const locationName = 'Test location'

  const expectedResponse: JoinedReviewList = {
    reviews: [
      {
        id: 'ac03e2e2-3340-420e-858e-8bd6dfd1f12a',
        additionalInfo: 'Test additional info',
        beerId: 'd57b9bd4-b8ab-484c-ae43-fa134f92bc7c',
        beerName: 'Test beer',
        breweries: [
          {
            id: 'c502aafe-1d1b-47f7-bd4a-ddfd30289033',
            name: 'Test brewery',
          },
        ],
        container: {
          id: '62892557-aae3-4bf1-80e2-f996552423f3',
          type: 'bottle',
          size: '0.33',
        },
        location: {
          id: locationId,
          name: locationName,
        },
        rating: 8,
        styles: [
          {
            id: '1290be01-54f5-4e93-9cd0-2636293d4afb',
            name: 'Test style',
          },
        ],
        time: '2026-03-12T00:00:00.000Z',
      },
    ],
    sorting: {
      order: 'beer_name',
      direction: 'desc',
    },
  }

  addTestServerResponse<JoinedReviewList>({
    method: 'GET',
    pathname: `/api/v1/location/${locationId}/review?order=time&direction=desc`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper locationId={locationId} />
    </Provider>,
  )

  await waitFor(() => {
    expect(getByText(locationName)).toBeDefined()
  })
})
