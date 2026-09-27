import { test } from '../../../test'
import { assertDeepEqual, assertDefined } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SearchLocationWithNavi from '../../../../src/components/internal/location/SearchLocationWithNavi'

import type { Location } from '../../../../src/components/types/location/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import type { UseDebounce } from '../../../../src/components/types/types'
import type { CreateLocationIf } from '../../../../src/components/types/location/types'
import { dontCall } from '../../../dont-call'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const activeSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

const createLocationIf: CreateLocationIf = {
  useCreate: () => ({
    create: dontCall,
    isLoading: false,
  }),
}

const location = {
  id: '8c8bd0e8-1f40-443b-bfcb-3fe5d9f6d343',
  name: 'Oluthuone Kaisla',
}

const anotherLocation = {
  id: '0314d1fc-0892-4bbf-8c78-6bfc7dcbc734',
  name: "St. Urho's Pub",
}

const locations: Location[] = [location, anotherLocation]

test('selects location', async () => {
  const user = setupUser()
  const selector = mockFunction(
    async (_url: string): Promise<void> => undefined,
  )
  const { getByRole } = render(
    <SearchLocationWithNavi
      navigateIf={{
        useNavigate: () => selector,
      }}
      searchLocationIf={{
        useSearch: () => ({
          search: async (): Promise<Location[]> => locations,
          isLoading: false,
        }),
        create: createLocationIf,
        searchFieldIf: activeSearch,
      }}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, 'Oluth')

  const itemOption = getByRole('option', { name: location.name })
  assertDefined(itemOption)
  await user.click(itemOption)
  assertDeepEqual(selector.mock.calls, [[`/locations/${location.id}`]])
})

test('shows no results', async () => {
  const user = setupUser()
  const selector = mockFunction(
    async (_url: string): Promise<void> => undefined,
  )
  const { getByRole, getByText } = render(
    <SearchLocationWithNavi
      navigateIf={{
        useNavigate: () => selector,
      }}
      searchLocationIf={{
        useSearch: () => ({
          search: async (): Promise<Location[]> => [],
          isLoading: false,
        }),
        create: createLocationIf,
        searchFieldIf: activeSearch,
      }}
    />,
  )

  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, 'Oluth')

  getByText('No results')
})
