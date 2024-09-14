import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import CreateContainer from './CreateContainer'
import { ContainerRequest } from '../../core/container/types'

const id = 'bbf9a644-74ad-4947-8335-ff1464f97a20'
const sizePlaceholder = 'Size, for example 0.25'
const typePlaceholder = 'Type'

test('creates container', async () => {
  const user = userEvent.setup()
  const selectContainer = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <CreateContainer
      select={selectContainer}
      createContainerIf={{
          useCreate: () => ({
            create: async (container: ContainerRequest) => ({
              ...container,
              id
            }),
            isLoading: false
          })
      }}
    />
  )
  const createButton = getByRole('button', { name: 'Create' })
  const typeInput = getByPlaceholderText(typePlaceholder)
  await user.type(typeInput, 'Bottle')
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  expect(createButton.hasAttribute('disabled')).toEqual(true)
  await user.type(sizeInput, '0.33')
  expect(createButton.hasAttribute('disabled')).toEqual(false)
  await act(async() => createButton.click())
  const createCalls = selectContainer.mock.calls
  expect(createCalls).toEqual([[{
    id,
    type: 'Bottle',
    size: '0.33'
  }]])
})
