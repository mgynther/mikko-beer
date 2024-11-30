import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SelectContainer from './SelectContainer'
import type { Container, ListContainersData } from '../../core/container/types'

const sizePlaceholder = 'Size, for example 0.25'
const typePlaceholder = 'Type'

const draftContainer: Container = {
  id: '17cc9e00-37a0-4807-9969-5730c4635a3c',
  type: 'draft',
  size: '0.33'
}

const bottleContainer: Container = {
  id: '96ba66cd-1a85-4e33-bbed-8e660da8f4d8',
  type: 'bottle',
  size: '0.33'
}

const useList = (): ListContainersData => ({
  data: {
    containers: [
      draftContainer,
      bottleContainer
    ],
  },
  isLoading: false
})

test('selects container', async () => {
  const onSelect = vitest.fn()
  const { getByRole } = render(
    <SelectContainer
      select={onSelect}
      reviewContainerIf={{
        createIf: {
          useCreate: () => {
            throw new Error('do not call')
          }
        },
        listIf: {
          useList
        }
      }}
    />
  )
  const containerSelect = getByRole('combobox')
  act(() => { containerSelect.click(); })
  const bottle = getByRole('option', { name: 'bottle 0.33' })
  await act(async () => {
    await userEvent.selectOptions(containerSelect, bottle)
  })
  const selectCalls = onSelect.mock.calls
  expect(selectCalls).toEqual([[bottleContainer]])
})

test('selects created container', async () => {
  const user = userEvent.setup()
  const onSelect = vitest.fn()
  const newContainer: Container = {
    id: '13d3e36c-e1db-4c6e-b4f8-d28e45209882',
    type: 'bottle',
    size: '0.50'
  }
  const { getByPlaceholderText, getByRole, } = render(
    <SelectContainer
      select={onSelect}
      reviewContainerIf={{
        createIf: {
          useCreate: () => ({
            create: async () => newContainer,
            isLoading: false
          })
        },
        listIf: {
          useList
        }
      }}
    />
  )
  const createRadio = getByRole('radio', { name: 'Create' })
  act(() => { createRadio.click(); })

  const createButton = getByRole('button', { name: 'Create' })
  const typeInput = getByPlaceholderText(typePlaceholder)
  await user.type(typeInput, newContainer.type)
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  await user.type(sizeInput, newContainer.size)
  await act(async() => { createButton.click(); })

  const selectCalls = onSelect.mock.calls
  expect(selectCalls).toEqual([[newContainer]])
})
