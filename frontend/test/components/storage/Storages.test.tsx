import { test } from '../../test'
import { render } from '../../render'
import Storages from '../../../src/components/storage/Storages'
import { Role } from '../../../src/components/types/user/types'
import type { UseUrlSearchParams } from '../../../src/components/types/types'
import type {
  CreateBeerIf,
  SearchBeerIf,
} from '../../../src/components/types/beer/types'
import type { ReviewContainerIf } from '../../../src/components/types/review/types'
import { dontCall } from '../../dont-call'
import { buildLogin } from '../types/login/builders'
import { buildStorage } from '../types/storage/builders'
import { buildUser } from '../types/user/builders'
import type { GetLogin } from '../../../src/components/types/login/types'
import { testLink } from '../link'

const dontCreate = {
  create: dontCall,
  isLoading: false,
}

const beerSearchIf: SearchBeerIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false,
  }),
  searchFieldIf: {
    useSearchField: dontCall,
    useDebounce: dontCall,
  },
}

const dontCreateBeerIf: CreateBeerIf = {
  useCreate: () => dontCreate,
  editBeerIf: {
    selectBreweryIf: {
      create: {
        useCreate: () => dontCreate,
      },
      search: {
        useSearch: () => ({
          search: dontCall,
          isLoading: false,
        }),
        searchFieldIf: {
          useSearchField: dontCall,
          useDebounce: dontCall,
        },
      },
    },
    selectStyleIf: {
      create: {
        useCreate: () => ({
          ...dontCreate,
          createdStyle: undefined,
          hasError: false,
          isSuccess: false,
        }),
      },
      list: {
        useList: () => ({
          styles: undefined,
          isLoading: false,
        }),
        searchFieldIf: {
          useSearchField: dontCall,
          useDebounce: dontCall,
        },
      },
    },
  },
}

const brewery = {
  id: '9eaf401e-58fc-467f-b400-693d4dda4cf9',
  name: 'Koskipanimo',
}

const style = {
  id: '8300d869-affc-4cd4-9d92-ad3f0540b462',
  name: 'American IPA',
}

const storage = buildStorage({
  beerName: 'Severin',
  bestBefore: '2023-12-10T12:00:00.000',
  breweries: [brewery],
  hasReview: true,
  styles: [style],
})

const reviewContainerIf: ReviewContainerIf = {
  createIf: {
    useCreate: () => dontCreate,
  },
  listIf: {
    useList: () => ({
      data: {
        containers: [],
      },
      isLoading: false,
    }),
  },
}

test('renders storage', () => {
  const useUrlSearchParams: UseUrlSearchParams = () => ({
    get: (key: string): string | undefined => {
      if (key === 'stats') {
        return 'monthly'
      }
    },
  })
  const getLogin: GetLogin = () =>
    buildLogin({ user: buildUser({ role: Role.viewer }) })
  const { getByRole, getByText } = render(
    <Storages
      linkComponent={testLink}
      getLogin={getLogin}
      listStoragesIf={{
        useList: () => ({
          data: {
            storages: [storage],
          },
          storages: {
            storages: [storage],
          },
          isLoading: false,
        }),
        delete: {
          useDelete: () => ({
            delete: dontCall,
          }),
          getLogin,
        },
      }}
      selectBeerIf={{
        create: dontCreateBeerIf,
        search: beerSearchIf,
      }}
      statsIf={{
        annual: {
          useAnnualStats: () => ({
            stats: undefined,
            isLoading: false,
          }),
        },
        monthly: {
          useMonthlyStats: () => ({
            stats: {
              monthly: [
                {
                  year: '2024',
                  month: '4',
                  count: '15',
                },
              ],
            },
            isLoading: false,
          }),
        },
        setSearch: () => undefined,
        useUrlSearchParams,
      }}
      createStorageIf={{
        useCreate: () => ({
          create: dontCall,
          hasError: false,
          isLoading: false,
        }),
      }}
      reviewContainerIf={reviewContainerIf}
    />,
  )
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: storage.beerName })
  getByRole('link', { name: style.name })
  getByText(storage.bestBefore.split('T')[0])
  getByRole('heading', { name: 'Storage beers (0/1)' })
  getByText('2024-04')
  getByText('15')
})
