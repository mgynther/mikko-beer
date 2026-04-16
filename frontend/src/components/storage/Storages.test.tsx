import { render } from '@testing-library/react'
import { test } from 'vitest'
import Storages from './Storages'
import type { Storage } from '../../core/storage/types'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'
import type { UseDebounce } from '../../core/types'
import type { CreateBeerIf, SearchBeerIf } from '../../core/beer/types'
import type { ReviewContainerIf } from '../../core/review/types'
import type { SearchParameters } from '../util'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false,
}

const beerSearchIf: SearchBeerIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false,
  }),
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

const storage: Storage = {
  id: '3c3478f6-c754-4fee-a2b1-a63b59ae6b77',
  beerId: '1c7ba165-a001-41a0-b8bb-bc52435df0c0',
  beerName: 'Severin',
  bestBefore: '2023-12-10T12:00:00.000',
  breweries: [brewery],
  container: {
    id: '3b7871b5-0016-4330-a134-23ef3aaee3eb',
    type: 'bottle',
    size: '0.33',
  },
  createdAt: '2021-05-05T10:00:00.000Z',
  hasReview: true,
  styles: [style],
}

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
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <Storages
        getLogin={() => ({
          user: {
            id: '9d157897-7787-4139-98bf-867300a3605c',
            username: 'viewer',
            role: Role.viewer,
          },
          authToken: 'auth',
          refreshToken: 'refresh',
        })}
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
          },
        }}
        paramsIf={{
          useParams: () => ({}),
          useSearch: () => {
            const searchParams: SearchParameters = {
              get: (key: string) => {
                if (key === 'stats') {
                  return 'monthly'
                }
              },
            }
            return searchParams
          },
        }}
        searchIf={{
          useSearch: () => ({
            activate: dontCall,
            isActive: true,
          }),
          useDebounce,
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
          setSearch: async () => undefined,
        }}
        createStorageIf={{
          useCreate: () => ({
            create: dontCall,
            hasError: false,
            isLoading: false,
          }),
        }}
        reviewContainerIf={reviewContainerIf}
      />
    </LinkWrapper>,
  )
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: storage.beerName })
  getByRole('link', { name: style.name })
  getByText(storage.bestBefore.split('T')[0])
  getByRole('heading', { name: 'Storage beers (0/1)' })
  getByText('2024-04')
  getByText('15')
})
