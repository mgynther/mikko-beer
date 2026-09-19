import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import listStorages from './list'
import type {
  StorageList,
  UseListStorages,
  ValidateStorageListOrUndefined,
} from './types'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStorageList: StorageList = {
  storages: [
    {
      id: 'c3d4e5f6-0718-4293-a4b5-c6d7e8f90112',
      beerId: 'd4e5f607-1829-43a4-b5c6-d7e8f9011223',
      beerName: 'Validated beer',
      bestBefore: '2026-01-01T00:00:00.000Z',
      breweries: [],
      container: {
        id: 'e5f60718-293a-44b5-8c6d-7e8f90112233',
        type: 'bottle',
        size: '0.33',
      },
      createdAt: '2025-01-01T00:00:00.000Z',
      hasReview: false,
      styles: [],
    },
  ],
}

const listed = { storages: [{ id: 'listed', beerName: 'Listed beer' }] }

function Helper(props: {
  onValidate: (result: unknown) => void
}): React.JSX.Element {
  const useStoreList: UseListStorages = () => ({
    data: listed,
    isLoading: false,
  })
  const validate: ValidateStorageListOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return validatedStorageList
  }
  const { storages, isLoading } = listStorages(useStoreList, validate).useList()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      {storages?.storages.map((storage) => (
        <div key={storage.id}>{storage.beerName}</div>
      ))}
    </div>
  )
}

test('list storages', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(<Helper onValidate={onValidate} />)

  expect(getByText(validatedStorageList.storages[0].beerName)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(listed)
})
