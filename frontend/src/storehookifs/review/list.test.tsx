import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listReviews from './list'
import type { JoinedReviewList } from '../../core/review/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

import Button from '../../components/common/Button'

const infiniteScroll = (): (() => void) => () => undefined

function Helper(): React.JSX.Element {
  const listIf = listReviews(infiniteScroll)
  const { list, reviewList } = listIf.useList()
  return (
    <div>
      {reviewList?.reviews.map((review) => (
        <div key={review.id}>{review.beerName}</div>
      ))}
      <Button
        onClick={() => {
          void list({
            pagination: { skip: 0, size: 10 },
            sorting: { order: 'time', direction: 'desc' },
          })
        }}
        text='Load'
      />
    </div>
  )
}

test('list reviews', async () => {
  const user = userEvent.setup()

  const expectedResponse: JoinedReviewList = {
    reviews: [
      {
        id: '25005da2-1edf-4306-8f16-8427649920a3',
        additionalInfo: 'Test additional info',
        beerId: '3f3f8f5b-a467-477f-8ea5-280caf19bf88',
        beerName: 'Test beer',
        breweries: [
          {
            id: '35392e18-c564-4fbb-9644-be8074ca43c2',
            name: 'Test brewery',
          },
        ],
        container: {
          id: 'faca8ac0-bfbf-4f46-a482-1067dee9b965',
          type: 'bottle',
          size: '0.33',
        },
        location: {
          id: 'a16535bf-4a55-476d-942e-d1b70d15df02',
          name: 'Test location',
        },
        rating: 8,
        styles: [
          {
            id: 'a8f08a1e-3403-451e-9246-fb61878aee35',
            name: 'Test style',
          },
        ],
        time: '2026-03-12T00:00:00.000Z',
      },
      {
        id: '8850bdeb-5852-4b5c-8312-9608f5f82bbb',
        additionalInfo: 'Another additional info',
        beerId: '14701ad4-a080-4d24-961d-6d2f58d46914',
        beerName: 'Another beer',
        breweries: [
          {
            id: '27c21507-bd4e-45f9-8241-492db8bbf525',
            name: 'Another brewery',
          },
        ],
        container: {
          id: '45e49deb-af1b-4884-8d59-31b990a4b1d7',
          type: 'can',
          size: '0.50',
        },
        location: {
          id: '63bab146-ab44-4f43-8ab0-33493a16738f',
          name: 'Another location',
        },
        rating: 7,
        styles: [
          {
            id: 'da0b36c4-f209-4865-932b-e2841314ea56',
            name: 'Another style',
          },
        ],
        time: '2026-03-11T00:00:00.000Z',
      },
    ],
    sorting: {
      order: 'rating',
      direction: 'desc',
    },
  }

  addTestServerResponse<JoinedReviewList>({
    method: 'GET',
    pathname: '/api/v1/review?size=10&skip=0&order=time&direction=desc',
    response: expectedResponse,
    status: 200,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>,
  )
  const loadButton = getByRole('button', { name: 'Load' })
  await user.click(loadButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.reviews[0].beerName)).toBeDefined()
    expect(getByText(expectedResponse.reviews[1].beerName)).toBeDefined()
  })
})
