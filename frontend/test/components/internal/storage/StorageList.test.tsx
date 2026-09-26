import { render } from '@testing-library/react'
import { test } from 'vitest'
import StorageList from '../../../../src/components/internal/storage/StorageList'
import { Role } from '../../../../src/components/types/user/types'
import { dontCall } from '../../../dont-call'
import { testLink } from '../../link'
import { buildLogin } from '../../types/login/builders'
import { buildStorage } from '../../types/storage/builders'
import { buildUser } from '../../types/user/builders'

const breweryOne = {
  id: 'a2725b45-e4d8-4892-a54b-e610f5b72aa9',
  name: 'Koskipanimo',
}

const breweryTwo = {
  id: 'cb968974-3471-4c2c-8553-10dfd7236404',
  name: 'Mallaskoski',
}

const styleOne = {
  id: '3839e4d6-7bf7-4289-86b2-96b95737beaa',
  name: 'American IPA',
}

const styleTwo = {
  id: 'f97b4276-e140-404e-a2c8-ae276d5ff88b',
  name: 'Doppelbock',
}

const storageOne = buildStorage({
  id: 'e09ad3aa-6ce2-4963-968d-fc28065f8229',
  beerName: 'Severin',
  bestBefore: '2023-12-10T12:00:00.000',
  breweries: [breweryOne],
  hasReview: false,
  styles: [styleOne],
})

const storageTwo = buildStorage({
  id: 'e734f0b3-1e62-46e6-8566-0ebf1659baa9',
  beerName: 'Yuletide Doppelbock',
  bestBefore: '2024-11-01T12:00:00.000',
  breweries: [breweryTwo],
  hasReview: true,
  styles: [styleTwo],
})

const adminLogin = buildLogin({ user: buildUser({ role: Role.admin }) })

test('renders storage list', async () => {
  const { getByRole, getByText } = render(
    <StorageList
      linkComponent={testLink}
      deleteStorageIf={{
        useDelete: () => ({
          delete: dontCall,
        }),
        getLogin: () => adminLogin,
      }}
      isLoading={false}
      isTitleVisible={true}
      storages={[storageOne, storageTwo]}
    />,
  )
  getByRole('link', { name: breweryOne.name })
  getByRole('link', { name: storageOne.beerName })
  getByRole('link', { name: styleOne.name })
  getByText(storageOne.bestBefore.split('T')[0])
  getByRole('link', { name: breweryTwo.name })
  getByRole('link', { name: storageTwo.beerName })
  getByRole('link', { name: styleTwo.name })
  getByText(storageTwo.bestBefore.split('T')[0])
  getByRole('heading', { name: 'Storage (1/2)' })
})
