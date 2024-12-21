import { render } from '@testing-library/react'
import { test } from 'vitest'
import StorageList from './StorageList'
import type { Storage } from '../../core/storage/types'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const breweryOne = {
  id: 'a2725b45-e4d8-4892-a54b-e610f5b72aa9',
  name: 'Koskipanimo'
}

const breweryTwo = {
  id: 'cb968974-3471-4c2c-8553-10dfd7236404',
  name: 'Mallaskoski'
}

const styleOne = {
  id: '3839e4d6-7bf7-4289-86b2-96b95737beaa',
  name: 'American IPA'
}

const styleTwo = {
  id: 'f97b4276-e140-404e-a2c8-ae276d5ff88b',
  name: 'Doppelbock'
}

const storageOne: Storage = {
  id: 'e09ad3aa-6ce2-4963-968d-fc28065f8229',
  beerId: '0badeb1c-95ee-422b-829f-4fa3974248aa',
  beerName: 'Severin',
  bestBefore: '2023-12-10',
  breweries: [breweryOne],
  container: {
    id: '498a18ff-3c07-496c-9e20-6aa7edcae59d',
    type: 'bottle',
    size: '0.33'
  },
  createdAt: '2020-09-12T12:00:00.000Z',
  styles: [styleOne]
}

const storageTwo: Storage = {
  id: 'e734f0b3-1e62-46e6-8566-0ebf1659baa9',
  beerId: 'f192c806-9807-4568-b990-5e2c22a6f6d2',
  beerName: 'Yuletide Doppelbock',
  bestBefore: '2024-11-01',
  breweries: [breweryTwo],
  container: {
    id: 'b912de3d-48c3-471a-a0c0-82b94e2d3da2',
    type: 'bottle',
    size: '0.33'
  },
  createdAt: '2021-08-11T11:00:00.000Z',
  styles: [styleTwo]
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

test('renders storage list', async () => {
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <StorageList
        deleteStorageIf={{
          useDelete: () => ({
            delete: dontCall
          })
        }}
        getLogin={() => adminLogin}
        isLoading={false}
        isTitleVisible={true}
        storages={[
          storageOne,
          storageTwo
        ]}
      />
    </LinkWrapper>
  )
  getByRole('link', { name: breweryOne.name })
  getByRole('link', { name: storageOne.beerName })
  getByRole('link', { name: styleOne.name })
  getByText(storageOne.bestBefore)
  getByRole('link', { name: breweryTwo.name })
  getByRole('link', { name: storageTwo.beerName })
  getByRole('link', { name: styleTwo.name })
  getByText(storageTwo.bestBefore)
})
