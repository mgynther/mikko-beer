import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import StorageList from './StorageList'
import type { Storage } from '../../core/storage/types'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const brewery = {
  id: 'a2725b45-e4d8-4892-a54b-e610f5b72aa9',
  name: 'Koskipanimo'
}

const style = {
  id: '52e03609-3721-4993-b103-979e61301605',
  name: 'American IPA'
}

const storage: Storage = {
  id: 'e09ad3aa-6ce2-4963-968d-fc28065f8229',
  beerId: '0badeb1c-95ee-422b-829f-4fa3974248aa',
  beerName: 'Severin',
  bestBefore: '2023-12-10',
  breweries: [brewery],
  container: {
    id: '498a18ff-3c07-496c-9e20-6aa7edcae59d',
    type: 'bottle',
    size: '0.33'
  },
  styles: [style]
}

const adminLogin = {
  user: {
    id: 'e809902c-f056-4c73-8929-31c87d164d85',
    username: 'admin',
    role: Role.admin
  },
  authToken: 'auth',
  refreshToken: 'refresh'
}

test('renders storage', async () => {
  const user = userEvent.setup()
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <StorageList
        deleteStorageIf={{
          useDelete: () => ({
            delete: dontCall
          })
        }}
        getConfirm={dontCall}
        getLogin={() => adminLogin}
        isLoading={false}
        isTitleVisible={true}
        storages={[
          storage
        ]}
      />
    </LinkWrapper>
  )
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: storage.beerName })
  getByRole('link', { name: style.name })
  getByText(storage.bestBefore)
  const reviewLink = getByRole('link', { name: 'Review' })
  const path = `/addreview/${storage.id}`
  expect(reviewLink.getAttribute('href')).toEqual(path)
  await user.click(reviewLink)
  expect(window.location.pathname).toEqual(path)
})

test('deletes storage', async () => {
  const user = userEvent.setup()
  const del = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <StorageList
        deleteStorageIf={{
          useDelete: () => ({
            delete: del
          })
        }}
        getConfirm={() => () => true}
        getLogin={() => adminLogin}
        isLoading={false}
        isTitleVisible={true}
        storages={[
          storage
        ]}
      />
    </LinkWrapper>
  )
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  expect(del.mock.calls).toEqual([[storage.id]])
})

test('does not delete storage on not confirmed', async () => {
  const user = userEvent.setup()
  const del = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <StorageList
        deleteStorageIf={{
          useDelete: () => ({
            delete: del
          })
        }}
        getConfirm={() => () => false}
        getLogin={() => adminLogin}
        isLoading={false}
        isTitleVisible={true}
        storages={[
          storage
        ]}
      />
    </LinkWrapper>
  )
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  expect(del.mock.calls).toEqual([])
})
