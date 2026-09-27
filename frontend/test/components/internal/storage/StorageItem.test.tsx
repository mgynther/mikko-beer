import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import StorageItem from '../../../../src/components/internal/storage/StorageItem'
import type { DeleteStorageIf } from '../../../../src/components/types/storage/types'
import { Role } from '../../../../src/components/types/user/types'
import { dontCall } from '../../../dont-call'
import { testLink } from '../../link'
import { buildLogin } from '../../types/login/builders'
import { buildStorage } from '../../types/storage/builders'
import { buildUser } from '../../types/user/builders'

const brewery = {
  id: 'b5639203-8448-40ff-84c1-cc9b9b50909c',
  name: 'Koskipanimo',
}

const style = {
  id: '26713c2b-07a1-4072-a6bf-32196bea1919',
  name: 'American IPA',
}

const storage = buildStorage({
  beerName: 'Severin',
  bestBefore: '2023-12-10T12:00:00.000',
  breweries: [brewery],
  styles: [style],
})

const adminLogin = buildLogin({ user: buildUser({ role: Role.admin }) })

const dontDelete: DeleteStorageIf = {
  useDelete: () => ({
    delete: dontCall,
  }),
  getLogin: () => adminLogin,
}

test('renders storage', async () => {
  const user = setupUser()
  const { getByRole, getByText } = render(
    <StorageItem
      linkComponent={testLink}
      deleteStorageIf={dontDelete}
      confirm={dontCall}
      storage={storage}
    />,
  )
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: storage.beerName })
  getByRole('link', { name: style.name })
  getByText(storage.bestBefore.split('T')[0])
  const openButton = getByRole('button', { name: 'Open ▼' })
  await user.click(openButton)
  const reviewLink = getByRole('link', { name: 'Review' })
  const path = `/addreview/${storage.id}`
  assertEqual(reviewLink.getAttribute('href'), path)
})

test('renders storage with review', async () => {
  const { getByRole, getByText } = render(
    <StorageItem
      linkComponent={testLink}
      deleteStorageIf={dontDelete}
      confirm={dontCall}
      storage={{
        ...storage,
        hasReview: true,
      }}
    />,
  )
  getByRole('link', { name: storage.beerName })
  getByText('*')
})

test('deletes storage', async () => {
  const user = setupUser()
  const del = mockFunction<[storageId: string]>()
  const { getByRole } = render(
    <StorageItem
      linkComponent={testLink}
      deleteStorageIf={{
        useDelete: () => ({
          delete: del,
        }),
        getLogin: () => adminLogin,
      }}
      confirm={(): boolean => true}
      storage={storage}
    />,
  )
  const openButton = getByRole('button', { name: 'Open ▼' })
  await user.click(openButton)
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  assertDeepEqual(del.mock.calls, [[storage.id]])
})

test('does not delete storage on not confirmed', async () => {
  const user = setupUser()
  const del = mockFunction<[storageId: string]>()
  const { getByRole } = render(
    <StorageItem
      linkComponent={testLink}
      deleteStorageIf={{
        useDelete: () => ({
          delete: del,
        }),
        getLogin: () => adminLogin,
      }}
      confirm={(): boolean => false}
      storage={storage}
    />,
  )
  const openButton = getByRole('button', { name: 'Open ▼' })
  await user.click(openButton)
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  assertDeepEqual(del.mock.calls, [])
})
