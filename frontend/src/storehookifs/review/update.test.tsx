import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import updateReview from './update'
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
  handler: () => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const updateIf = updateReview(
    {
      useSearch: dontCall,
      create: {
        useCreate: dontCall
      }
    },
    {
      search: {
        useSearch: dontCall
      },
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
  const update = updateIf.useUpdate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await update.update(props.review)
      props.handler()
    }
    void doHandle()
  }
  return (
    <>
      <Button onClick={handleClick} text='Test' />
      {update.isLoading && <div>Loading</div>}
      {!update.isLoading && <div>Not loading</div>}
    </>
  )
}

test('update review', async () => {
  const user = userEvent.setup()

  const expectedResponse: { review: Review } = {
    review: {
      id: '47726cec-e692-4a07-8eb3-410f69610b04',
      additionalInfo: 'Test additional info',
      beer: '618002af-1732-4772-9df1-b8faff268cb5',
      container: '921b4081-8c73-4931-aaf1-69a6ce78a2b6',
      location: 'd36fb4db-78e6-484a-8bd9-4afee3472fd6',
      rating: 8,
      smell: 'Test smell',
      taste: 'Test taste',
      time: '2026-03-12T00:00:00.000Z'
    }
  }

  addTestServerResponse<{ review: Review }>({
    method: 'PUT',
    pathname: `/api/v1/review/${expectedResponse.review.id}`,
    response: expectedResponse,
    status: 200
  })

  const handler = vitest.fn()
  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper
        handler={handler}
        review={expectedResponse.review}
      />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalled()
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
})
