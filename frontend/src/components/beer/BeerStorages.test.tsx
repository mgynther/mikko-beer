import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import LinkWrapper from '../LinkWrapper'
import BeerStorages from './BeerStorages'
import type { ListStoragesByIf, Storage } from '../../core/storage/types'
import type { Beer } from '../../core/beer/types'
import type { Container } from '../../core/container/types'
import { Role } from '../../core/user/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const brewery = {
  id: 'd23d7310-98af-4ea4-ac19-06a19c745e9a',
  name: 'Koskipanimo',
}

const style = {
  id: 'cb490c9c-58a8-4281-af22-fcd3ae695f6b',
  name: 'IPA',
  parents: [],
  children: [],
}

const beer: Beer = {
  id: '1ea6cacf-d840-4fdd-ad3a-8baa30a6da68',
  name: 'Smörre',
  breweries: [brewery],
  styles: [style],
}

const container: Container = {
  id: '1e2624b0-08f9-4713-8cd4-a4242e58c6a5',
  type: 'bottle',
  size: '0.33',
}

const storage: Storage = {
  id: '39689fb5-9b7e-41fe-acba-00afdc215bc1',
  beerId: beer.id,
  beerName: beer.name,
  bestBefore: '2022-01-21T12:00:00.000',
  breweries: [brewery],
  container,
  createdAt: '2023-02-02T12:00:00.000Z',
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

function getListStoragesByBeerIf(
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
      <BeerStorages
        beerId={beer.id}
        listStoragesByBeerIf={getListStoragesByBeerIf([storage])}
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
      <BeerStorages
        beerId={beer.id}
        listStoragesByBeerIf={getListStoragesByBeerIf(undefined)}
        getLogin={() => login}
      />
    </LinkWrapper>,
  )
  expect(container.children.length).toEqual(0)
})
