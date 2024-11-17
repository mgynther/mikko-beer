import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import StorageList from './StorageList'
import type { Storage } from '../../core/storage/types'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'

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

test('renders storage', () => {
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <StorageList
        getLogin={() => ({
          user: {
            id: 'e809902c-f056-4c73-8929-31c87d164d85',
            username: 'admin',
            role: Role.admin
          },
          authToken: 'auth',
          refreshToken: 'refresh'
        })}
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
  expect(reviewLink.getAttribute('href')).toEqual(`/addreview/${storage.id}`)
})
