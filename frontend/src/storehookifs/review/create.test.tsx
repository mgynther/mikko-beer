import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import createReview from './create'
import type { Review } from '../../core/review/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

const dontCall = (): any => {
  throw new Error('must not be called')
}

interface HelperProps {
  review: Review
}

function Helper(props: HelperProps): React.JSX.Element {
  const createIf = createReview(
    () => new Date(props.review.time),
    {
      useSearch: dontCall,
      create: {
        useCreate: dontCall
      }
    },
    {
      create: {
        useCreate: dontCall,
        editBeerIf: {
          selectBreweryIf: {
            create: {
              useCreate: dontCall
            },
            search: {
              useSearch: dontCall
            }
          },
          selectStyleIf: {
            create: {
              useCreate: dontCall
            },
            list: {
              useList: dontCall
            }
          }
        }
      },
      search: {
        useSearch: dontCall
      }
    },
    {
      createIf: {
        useCreate: dontCall
      },
      listIf: {
        useList: dontCall
      }
    }
  )
  const { create, review } = createIf.useCreate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await create({
        body: props.review,
        storageId: undefined
      })
    }
    void doHandle()
  }
  return (
    <div>
      <Button onClick={handleClick} text='Test' />
      <div>{review?.taste}</div>
    </div>
  )
}

test('create review', async () => {
  const user = userEvent.setup()

  const expectedResponse: { review: Review } = {
    review: {
      id: '5853fbbb-aa6b-4710-ae42-36aca1c750de',
      beer: '71f4f237-42e7-4738-b015-3ebc09bdd99f',
      additionalInfo: 'additional',
      container: '44b0ee1a-fedd-4ebc-b301-f369fdf22d5b',
      location: '0a7fed33-db58-441d-8e28-33d00d2c1a9d',
      rating: 10,
      smell: 'Citrusy, pine',
      taste: 'Bitter, clean, delicious',
      time: '2025-10-10T12:00:00.000Z'
    }
  }

  addTestServerResponse<{ review: Review }>({
    method: 'POST',
    pathname: '/api/v1/review',
    response: expectedResponse,
    status: 201
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper review={expectedResponse.review} />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.review.taste)).toBeDefined()
  })
})
