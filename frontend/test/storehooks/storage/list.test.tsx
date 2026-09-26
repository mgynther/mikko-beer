import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import listStorages from '../../../src/storehooks/storage/list'
import type {
  StorageList,
  UseListStorages,
  ValidateStorageListOrUndefined,
} from '../../../src/storehooks/storage/types'
import { buildStorage } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStorageList: StorageList = {
  storages: [buildStorage({ beerName: 'Validated beer' })],
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
