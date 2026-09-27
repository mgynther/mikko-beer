import { test } from '../../../test'
import { assertEqual } from '../../../assert'
import { render } from '../../../render'
import BreweryStorages from '../../../../src/components/internal/brewery/BreweryStorages'
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

const storage = buildStorage({
  beerName: 'Smörre',
  bestBefore: '2024-06-28T12:00:00.000',
  breweries: [brewery],
  styles: [style],
})

const login = buildLogin({ user: buildUser({ role: Role.admin }) })

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
      getLogin: () => login,
    },
  }
}

test('render storages', async () => {
  const { getByText } = render(
    <BreweryStorages
      linkComponent={testLink}
      breweryId={breweryId}
      listStoragesByBreweryIf={getListStoragesByBreweryIf([storage])}
    />,
  )
  getByText(brewery.name)
  getByText(storage.beerName)
  getByText(style.name)
  getByText(storage.bestBefore.split('T')[0])
})

test('render nothing on loading', async () => {
  const { container } = render(
    <BreweryStorages
      linkComponent={testLink}
      breweryId={breweryId}
      listStoragesByBreweryIf={getListStoragesByBreweryIf(undefined)}
    />,
  )
  assertEqual(container.children.length, 0)
})
