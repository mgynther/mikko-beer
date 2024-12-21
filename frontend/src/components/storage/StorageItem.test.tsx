import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import StorageItem from './StorageItem'
import type { Storage } from '../../core/storage/types'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const brewery = {
  id: 'b5639203-8448-40ff-84c1-cc9b9b50909c',
  name: 'Koskipanimo'
}

const style = {
  id: '26713c2b-07a1-4072-a6bf-32196bea1919',
  name: 'American IPA'
}

const storage: Storage = {
  id: 'd02c5fb5-a993-447d-824a-93bfeb85949a',
  beerId: '14167707-87d1-49f1-b6b1-0a95ebfb5afb',
  beerName: 'Severin',
  bestBefore: '2023-12-10',
  breweries: [brewery],
  container: {
    id: 'a5bc2c5b-50ae-4f47-b374-63bc2be4f524',
    type: 'bottle',
    size: '0.33'
  },
  createdAt: '2020-09-12T12:00:00.000Z',
  styles: [style]
}

const adminLogin = {
  user: {
    id: 'ce26ca10-9238-4b84-a0e6-6ac3a2890449',
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
      <StorageItem
        deleteStorageIf={{
          useDelete: () => ({
            delete: dontCall
          })
        }}
        getConfirm={dontCall}
        getLogin={() => adminLogin}
        storage={storage}
      />
    </LinkWrapper>
  )
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: storage.beerName })
  getByRole('link', { name: style.name })
  getByText(storage.bestBefore)
  const openButton = getByRole('button', { name: 'Open ▼' })
  await user.click(openButton)
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
      <StorageItem
        deleteStorageIf={{
          useDelete: () => ({
            delete: del
          })
        }}
        getConfirm={() => () => true}
        getLogin={() => adminLogin}
        storage={storage}
      />
    </LinkWrapper>
  )
  const openButton = getByRole('button', { name: 'Open ▼' })
  await user.click(openButton)
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  expect(del.mock.calls).toEqual([[storage.id]])
})

test('does not delete storage on not confirmed', async () => {
  const user = userEvent.setup()
  const del = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <StorageItem
        deleteStorageIf={{
          useDelete: () => ({
            delete: del
          })
        }}
        getConfirm={() => () => false}
        getLogin={() => adminLogin}
        storage={storage}
      />
    </LinkWrapper>
  )
  const openButton = getByRole('button', { name: 'Open ▼' })
  await user.click(openButton)
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  expect(del.mock.calls).toEqual([])
})
