import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listReviewsByLocation from './listByLocation'
import type {
  JoinedReviewList,
  ListFilterIf,
  ReviewListFilter,
  ReviewSorting,
  SetSearch,
} from '../../core/review/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import type { UseDebounce, YearMonth } from '../../core/types'
import { testTimes } from '../../../test-util/filter-time'

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

interface HelperProps {
  locationId: string
}

const sorting: ReviewSorting = {
  order: 'beer_name',
  direction: 'desc',
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const filter: ReviewListFilter = {
  minRating: 4,
  maxRating: 10,
  minTime: testTimes.min.utcTimestamp,
  maxTime: testTimes.max.utcTimestamp,
}

const listFilterIf: (setSearch: SetSearch) => ListFilterIf = (
  setSearch: SetSearch,
) => ({
  getUseDebounce,
  minTime,
  maxTime,
  setSearch,
})

function Helper(props: HelperProps): React.JSX.Element {
  const setSearch = vitest.fn()
  const listIf = listReviewsByLocation(listFilterIf(setSearch))
  const { reviews } = listIf.useList({
    id: props.locationId,
    sorting,
    filter,
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
    sorting,
  }

  addTestServerResponse<JoinedReviewList>({
    method: 'GET',
    // prettier-ignore
    pathname: `/api/v1/location/${
      locationId
    }/review?order=${
      sorting.order
    }&direction=${
      sorting.direction
    }&min_rating=${
      filter.minRating
    }&max_rating=${
      filter.maxRating
    }&min_time=${
      filter.minTime
    }&max_time=${
      filter.maxTime
    }`,
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
