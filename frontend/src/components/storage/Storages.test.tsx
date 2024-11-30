import { render } from '@testing-library/react'
import { test } from 'vitest'
import Storages from './Storages'
import type { Storage } from '../../core/storage/types'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'
import type { UseDebounce } from '../../core/types'

const useDebounce: UseDebounce = (str: string) => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const beerSearchIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false
  })
}

const dontCreateBeerIf = {
  useCreate: () => dontCreate,
  editBeerIf: {
    selectBreweryIf: {
      create: {
        useCreate: () => dontCreate
      },
      search: {
        useSearch: () => ({
          search: dontCall,
          isLoading: false
        })
      }
    },
    selectStyleIf: {
      create: {
        useCreate: () => ({
          ...dontCreate,
          createdStyle: undefined,
          hasError: false,
          isSuccess: false
        })
      },
      list: {
        useList: () => ({
          styles: undefined,
          isLoading: false,
        })
      }
    }
  }
}

const brewery = {
  id: '9eaf401e-58fc-467f-b400-693d4dda4cf9',
  name: 'Koskipanimo'
}

const style = {
  id: '8300d869-affc-4cd4-9d92-ad3f0540b462',
  name: 'American IPA'
}

const storage: Storage = {
  id: '3c3478f6-c754-4fee-a2b1-a63b59ae6b77',
  beerId: '1c7ba165-a001-41a0-b8bb-bc52435df0c0',
  beerName: 'Severin',
  bestBefore: '2023-12-10',
  breweries: [brewery],
  container: {
    id: '3b7871b5-0016-4330-a134-23ef3aaee3eb',
    type: 'bottle',
    size: '0.33'
  },
  styles: [style]
}

const reviewContainerIf = {
  createIf: {
    useCreate: () => dontCreate
  },
  listIf: {
    useList: () => ({
      data: {
        containers: []
      },
      isLoading: false
    })
  }
}

test('renders storage', () => {
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <Storages
        getLogin={() => ({
          user: {
            id: '9d157897-7787-4139-98bf-867300a3605c',
            username: 'viewer',
            role: Role.viewer
          },
          authToken: 'auth',
          refreshToken: 'refresh'
        })}
        listStoragesIf={{
          useList: () => ({
            data: {
              storages: [
                storage
              ]
            },
            storages: {
              storages: [storage]
            },
            isLoading: false
          })
        }}
        searchIf={{
          useSearch: () => ({
            activate: dontCall,
            isActive: true
          }),
          useDebounce
        }}
        selectBeerIf={{
          create: dontCreateBeerIf,
          search: beerSearchIf
        }}
        createStorageIf={{
          useCreate: () => ({
            create: dontCall,
            hasError: false,
            isLoading: false
          })
        }}
        reviewContainerIf={reviewContainerIf}
      />
    </LinkWrapper>
  )
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: storage.beerName })
  getByRole('link', { name: style.name })
  getByText(storage.bestBefore)
})
