import { test } from '../../../test'
import { assertEqual } from '../../../assert'
import { render } from '../../../render'
import BeerStorages from '../../../../src/components/internal/beer/BeerStorages'
import type {
  ListStoragesByIf,
  Storage,
} from '../../../../src/components/types/storage/types'
import { Role } from '../../../../src/components/types/user/types'
import { dontCall } from '../../../dont-call'
import { testLink } from '../../link'
import { buildLogin } from '../../types/login/builders'
import { buildStorage } from '../../types/storage/builders'
import { buildUser } from '../../types/user/builders'

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

const storage = buildStorage({
  beerName: 'Smörre',
  bestBefore: '2022-01-21T12:00:00.000',
  breweries: [brewery],
  styles: [style],
})

const login = buildLogin({ user: buildUser({ role: Role.admin }) })

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
      getLogin: () => login,
    },
  }
}

test('render storages', async () => {
  const { getByText } = render(
    <BeerStorages
      linkComponent={testLink}
      beerId={storage.beerId}
      listStoragesByBeerIf={getListStoragesByBeerIf([storage])}
    />,
  )
  getByText(brewery.name)
  getByText(storage.beerName)
  getByText(style.name)
  getByText(storage.bestBefore.split('T')[0])
})

test('render nothing on loading', async () => {
  const { container } = render(
    <BeerStorages
      linkComponent={testLink}
      beerId={storage.beerId}
      listStoragesByBeerIf={getListStoragesByBeerIf(undefined)}
    />,
  )
  assertEqual(container.children.length, 0)
})
