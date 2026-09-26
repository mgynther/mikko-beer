import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import listStoragesByBrewery from '../../../src/storehooks/storage/listByBrewery'
import type {
  StorageList,
  UseListStoragesBy,
  ValidateStorageListOrUndefined,
} from '../../../src/storehooks/storage/types'
import { buildStorage } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStorageList: StorageList = {
  storages: [buildStorage({ beerName: 'Validated beer' })],
}

const listed = { storages: [{ id: 'listed', beerName: 'Listed beer' }] }

const breweryId = 'a1b2c3d4-e5f6-4071-8293-a4b5c6d7e8f9'

interface HelperProps {
  onList: (id: string) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListStoragesBy = (id: string) => {
    props.onList(id)
    return { data: listed, isLoading: false }
  }
  const validate: ValidateStorageListOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return validatedStorageList
  }
  const { storages, isLoading } = listStoragesByBrewery(
    useStoreList,
    validate,
  ).useList(breweryId)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      {storages?.storages.map((storage) => (
        <div key={storage.id}>{storage.beerName}</div>
      ))}
    </div>
  )
}

test('list storages by brewery', () => {
  const onList = vitest.fn()
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper onList={onList} onValidate={onValidate} />,
  )

  expect(getByText(validatedStorageList.storages[0].beerName)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onList).toHaveBeenCalledWith(breweryId)
  expect(onValidate).toHaveBeenCalledWith(listed)
})
