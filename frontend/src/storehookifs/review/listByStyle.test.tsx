import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listReviewsByStyle from './listByStyle'
import type {
  JoinedReviewList,
  ListFilterIf,
  ReviewListFilter,
  ReviewSorting,
  SetSearch,
} from '../../core/review/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import { testTimes } from '../../../test-util/filter-time'
import type { UseDebounce, YearMonth } from '../../core/types'

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

interface HelperProps {
  styleId: string
}

const sorting: ReviewSorting = {
  order: 'brewery_name',
  direction: 'asc',
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
  useUrlSearchParams: () => ({ get: () => undefined }),
})

function Helper(props: HelperProps): React.JSX.Element {
  const setSearch = vitest.fn()
  const listIf = listReviewsByStyle(listFilterIf(setSearch))
  const { reviews } = listIf.useList({
    id: props.styleId,
    sorting,
    filter,
  })
  return (
    <div>
      {reviews?.reviews.map((review) => (
        <div key={review.id}>{review.styles[0].name}</div>
      ))}
    </div>
  )
}

test('list reviews by style', async () => {
  const styleId = '20903da1-8c16-42ed-999d-911bc489020d'
  const styleName = 'Test style'

  const expectedResponse: JoinedReviewList = {
    reviews: [
      {
        id: '1fbcfd42-5e10-4f5a-b299-3cbc89bd4698',
        additionalInfo: 'Test additional info',
        beerId: '092e6c0e-8e3c-4e2d-a6fd-106f29b8a121',
        beerName: 'Test beer',
        breweries: [
          {
            id: '6a51d043-17bf-4856-bd06-4ed952d2edbd',
            name: 'Test brewery',
          },
        ],
        container: {
          id: 'b0bd7203-fb85-4343-bc23-ec9f26a4deb7',
          type: 'bottle',
          size: '0.33',
        },
        location: {
          id: 'ae1b4670-cff6-49a3-91d0-019da470bb1a',
          name: 'Test location',
        },
        rating: 8,
        styles: [
          {
            id: styleId,
            name: styleName,
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
    pathname: `/api/v1/style/${
      styleId
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
      <Helper styleId={styleId} />
    </Provider>,
  )
  await waitFor(() => {
    expect(getByText(styleName)).toBeDefined()
  })
})
