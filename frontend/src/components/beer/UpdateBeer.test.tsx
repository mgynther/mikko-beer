import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import UpdateBeer from './UpdateBeer'

const id = 'b3cee2c7-81b8-4b4d-8625-f5a3955258eb'
const beerName = 'Kukko Pils'

const brewery = {
  id: 'ddc2da9d-1d79-472a-86e3-2636a573e96b',
  name: 'Laitilan Wirvoitusjuomatehdas'
}

const anotherBrewery = {
  id: '8098ccd8-8fcc-42d2-8057-d55884d6e424',
  name: 'Laitilan'
}

const style = {
  id: 'ef25990d-04fe-4937-8ca0-4da18c2e31d7',
  name: 'pils',
  parents: ['1f1eb9e4-8925-45a5-9dd5-7b34bba11418']
}

const anotherStyle = {
  id: 'f90f89cf-7967-4097-9f92-06ac0ec649d7',
  name: 'lager',
  parents: ['1f1eb9e4-8925-45a5-9dd5-7b34bba11418']
}

const dontCall = (): any => {
  throw new Error('must not be called')
}

const useDebounce = (str: string): string => str

const dontSelectBrewery = {
  create: {
    useCreate: () => ({
      create: dontCall,
      isLoading: false
    })
  },
  search: {
    useSearch: () => ({
      search: dontCall,
      isLoading: false
    })
  }
}

const dontSelectStyle = {
  create: {
    useCreate: () => ({
      create: dontCall,
      createdStyle: undefined,
      hasError: false,
      isLoading: false,
      isSuccess: false
    })
  },
  list: {
    useList: () => ({
      styles: undefined,
      isLoading: false
    })
  }
}

const dontSearch = {
  useSearch: () => ({
    activate: dontCall,
    isActive: false
  }),
  useDebounce
}

const doSearch = {
  useSearch: () => ({
    activate: () => undefined,
      isActive: true
  }),
  useDebounce
}

test('updates beer name', async () => {
  const user = userEvent.setup()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateBeer
      initialBeer={{
        breweries: [brewery],
        id,
        name: 'Kukko pils',
        styles: [style]
      }}
      updateBeerIf={{
        useUpdate: () => ({
          update,
          isLoading: false
        }),
        editBeerIf: {
          selectBreweryIf: dontSelectBrewery,
          selectStyleIf: dontSelectStyle
        }
      }}
      searchIf={dontSearch}
      onCancel={dontCall}
      onSaved={onSaved}
    />
  )
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  await user.type(nameInput, beerName)
  const saveButton = getByRole('button', { name: 'Save' })
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([[{
    id,
    breweries: [brewery.id],
    name: beerName,
    styles: [style.id],
  }]])
  const saveCalls = onSaved.mock.calls
  expect(saveCalls).toEqual([[]])
})

test('updates beer brewery', async () => {
  const user = userEvent.setup()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getAllByRole, getByRole } = render(
    <UpdateBeer
      initialBeer={{
        breweries: [brewery],
        id,
        name: beerName,
        styles: [style]
      }}
      updateBeerIf={{
        useUpdate: () => ({
          update,
          isLoading: false
        }),
        editBeerIf: {
          selectBreweryIf: {
            create: {
              useCreate: () => ({
                create: dontCall,
                isLoading: false
              })
            },
            search: {
              useSearch: () => ({
                search: async () => [anotherBrewery],
                isLoading: false
              })
            }
          },
          selectStyleIf: dontSelectStyle
        }
      }}
      searchIf={doSearch}
      onCancel={dontCall}
      onSaved={onSaved}
    />
  )
  const changeButton = getAllByRole('button', { name: 'Change' })
  await user.click(changeButton[0])
  const searchBreweryField = getByPlaceholderText('Search brewery')
  await user.type(searchBreweryField, 'Laiti')
  const breweryButton = getByRole('button', { name: anotherBrewery.name })
  await user.click(breweryButton)
  const saveButton = getByRole('button', { name: 'Save' })
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([[{
    id,
    breweries: [anotherBrewery.id],
    name: beerName,
    styles: [style.id],
  }]])
  const saveCalls = onSaved.mock.calls
  expect(saveCalls).toEqual([[]])
})

test('updates beer style', async () => {
  const user = userEvent.setup()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getAllByRole, getByRole } = render(
    <UpdateBeer
      initialBeer={{
        breweries: [brewery],
        id,
        name: beerName,
        styles: [style]
      }}
      updateBeerIf={{
        useUpdate: () => ({
          update,
          isLoading: false
        }),
        editBeerIf: {
          selectBreweryIf: dontSelectBrewery,
          selectStyleIf: {
            create: {
              useCreate: () => ({
                create: dontCall,
                createdStyle: undefined,
                hasError: false,
                isLoading: false,
                isSuccess: false
              })
            },
            list: {
              useList: () => ({
                styles: [anotherStyle],
                isLoading: false
              })
            }
          }
        }
      }}
      searchIf={doSearch}
      onCancel={dontCall}
      onSaved={onSaved}
    />
  )
  const changeButton = getAllByRole('button', { name: 'Change' })
  await user.click(changeButton[1])
  const searchBreweryField = getByPlaceholderText('Search style')
  await user.type(searchBreweryField, 'Lager')
  const breweryButton = getByRole('button', { name: anotherStyle.name })
  await user.click(breweryButton)
  const saveButton = getByRole('button', { name: 'Save' })
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([[{
    id,
    breweries: [brewery.id],
    name: beerName,
    styles: [anotherStyle.id],
  }]])
  const saveCalls = onSaved.mock.calls
  expect(saveCalls).toEqual([[]])
})

test('cancels update', async () => {
  const onCanceled = vitest.fn()
  const { getByRole } = render(
    <UpdateBeer
      initialBeer={{
        breweries: [brewery],
        id,
        name: beerName,
        styles: [style]
      }}
      updateBeerIf={{
        useUpdate: () => ({
          update: dontCall,
          isLoading: false
        }),
        editBeerIf: {
          selectBreweryIf: dontSelectBrewery,
          selectStyleIf: dontSelectStyle
        }
      }}
      searchIf={dontSearch}
      onCancel={onCanceled}
      onSaved={dontCall}
    />
  )
  const cancelButton = getByRole('button', { name: 'Cancel' })
  expect(cancelButton.hasAttribute('disabled')).toEqual(false)
  cancelButton.click()
  const cancelCalls = onCanceled.mock.calls
  expect(cancelCalls).toEqual([[]])
})
