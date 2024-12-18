import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import CreateBrewery from './CreateBrewery'
import type { CreateBreweryRequest } from '../../core/brewery/types'

const id = '37e1e052-f558-40e1-ae50-4719d2d5f3cc'
const namePlaceholder = 'Create brewery'

test('creates brewery', async () => {
  const user = userEvent.setup()
  const selectBrewery = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <CreateBrewery
      select={selectBrewery}
      createBreweryIf={{
          useCreate: () => ({
            create: async (brewery: CreateBreweryRequest) => ({
              ...brewery,
              id
            }),
            isLoading: false
          })
      }}
    />
  )
  const createButton = getByRole('button', { name: 'Create' })
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'Salama Brewing')
  expect(createButton.hasAttribute('disabled')).toEqual(false)
  await user.click(createButton)
  const createCalls = selectBrewery.mock.calls
  expect(createCalls).toEqual([[{
    id,
    name: 'Salama Brewing'
  }]])
})
