import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import LinkWrapper from '../LinkWrapper'
import BreweryStorages from './BreweryStorages'
import type { ListStoragesByIf, Storage } from '../../core/storage/types'
import type { Beer } from '../../core/beer/types'
import type { Container } from '../../core/container/types'
import { Role } from '../../core/user/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const breweryId = '6abf9c04-2aaa-42da-b8cb-a5eaa6bb0ff8'

const brewery = {
  id: breweryId,
  name: 'Koskipanimo',
}

const style = {
  id: '40232cd7-ea5b-4ef3-a44b-8d2dd3f884b2',
  name: 'IPA',
  parents: [],
  children: [],
}

const beer: Beer = {
  id: '36b72ef1-ed5e-430c-8748-48554cbcda23',
  name: 'Smörre',
  breweries: [brewery],
  styles: [style],
}

const container: Container = {
  id: '678d1052-b81e-49d5-b222-620dbd4c817f',
  type: 'bottle',
  size: '0.33',
}

const storage: Storage = {
  id: 'e37d284f-49af-41fc-8fd9-8ec1f5b8fca2',
  beerId: beer.id,
  beerName: beer.name,
  bestBefore: '2024-06-28T12:00:00.000',
  breweries: [brewery],
  container,
  createdAt: '2024-03-01T12:00:00.000Z',
  hasReview: false,
  styles: [style],
}

const login = {
  user: {
    id: 'dc39260f-b459-4688-9103-08ef7ad903b0',
    username: 'mikko',
    role: Role.admin,
  },
  authToken: '',
  refreshToken: '',
}

function getListStoragesByBreweryIf(
  storages: Storage[] | undefined,
): ListStoragesByIf {
  return {
    useList: () => ({
      storages: storages
        ? {
            storages,
          }
        : undefined,
      isLoading: storages !== undefined,
    }),
    delete: {
      useDelete: () => ({
        delete: dontCall,
      }),
    },
  }
}

test('render storages', async () => {
  const { getByText } = render(
    <LinkWrapper>
      <BreweryStorages
        breweryId={breweryId}
        listStoragesByBreweryIf={getListStoragesByBreweryIf([storage])}
        getLogin={() => login}
      />
    </LinkWrapper>,
  )
  getByText(brewery.name)
  getByText(beer.name)
  getByText(style.name)
  getByText(storage.bestBefore.split('T')[0])
})

test('render nothing on loading', async () => {
  const { container } = render(
    <LinkWrapper>
      <BreweryStorages
        breweryId={breweryId}
        listStoragesByBreweryIf={getListStoragesByBreweryIf(undefined)}
        getLogin={() => login}
      />
    </LinkWrapper>,
  )
  expect(container.children.length).toEqual(0)
})
