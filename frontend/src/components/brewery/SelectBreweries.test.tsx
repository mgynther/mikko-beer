import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SelectBreweries from './SelectBreweries'
import type { Brewery, SearchBreweryIf } from '../../core/brewery/types'
import type { UseDebounce } from '../../core/types'

const brewery: Brewery = {
  id: '69ccb1b1-ee01-446d-b41f-58f57a14148f',
  name: 'Koskipanimo'
}

const anotherBrewery: Brewery = {
  id: 'a0bb0b55-c2d0-4150-9f18-8e3808cab0c3',
  name: 'Mallaskoski'
}

const useCreate = (): any => {
  throw new Error('do not call')
}

const search: SearchBreweryIf = {
  useSearch: () => ({
    search: async () => ([
      anotherBrewery
    ]),
    isLoading: false
  })
}

const useDebounce: UseDebounce = (str: string) => str

test('selects one more brewery', async () => {
  const user = userEvent.setup()
  const onSelect = vitest.fn()
  const { findByRole, getByPlaceholderText, getByRole } = render(
    <SelectBreweries
      initialBreweries={[ brewery ]}
      select={onSelect}
      selectBreweryIf={{
        create: { useCreate },
        search
      }}
      searchIf={{
        useSearch: () => ({
          activate: () => undefined,
          isActive: true
        }),
        useDebounce
      }}
    />
  )

  const addButton = getByRole('button', { name: 'Add brewery' })
  await user.click(addButton)

  const brewerySearch = getByPlaceholderText('Search brewery')
  await user.type(brewerySearch, anotherBrewery.name)
  const breweryOption =
    await findByRole('button', { name: anotherBrewery.name })
  await user.click(breweryOption)
  const selectCalls = onSelect.mock.calls
  expect(selectCalls).toEqual([ [[]], [[]], [[brewery.id, anotherBrewery.id]] ])
})

test('removes selected brewery', async () => {
  const user = userEvent.setup()
  const onSelect = vitest.fn()
  const { getAllByRole, getByRole } = render(
    <SelectBreweries
      initialBreweries={[ brewery, anotherBrewery ]}
      select={onSelect}
      selectBreweryIf={{
        create: { useCreate },
        search
      }}
      searchIf={{
        useSearch: () => ({
          activate: () => undefined,
          isActive: false
        }),
        useDebounce
      }}
    />
  )
  const changeButtons = getAllByRole('button', { name: 'Change' })
  await user.click(changeButtons[0])

  const selectCalls = onSelect.mock.calls
  expect(selectCalls).toEqual([[[]]])

  const removeButton = getByRole('button', { name: 'Remove' })
  await user.click(removeButton)

  const finalSelectedCalls = onSelect.mock.calls
  expect(finalSelectedCalls).toEqual([ [[]], [[]], [[anotherBrewery.id] ]])
})
