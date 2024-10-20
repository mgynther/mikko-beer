import { act, render, fireEvent } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import { expect, test, vitest } from "vitest"
import AddReview, { type Props as AddReviewProps } from "./AddReview"
import { loadingIndicatorText } from "../common/LoadingIndicator"
import type { UseDebounce } from "../../core/types"

const useDebounce: UseDebounce = (str: string) => str

const dontCall = () => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const beerId = '0372fdc8-faa5-443c-bacc-4b68b9e4ebf8'
const beerName = 'Severin'
const beerSearchResult = {
  id: beerId,
  name: beerName,
  breweries: [{
    id: '2eaa6fcc-60b5-4516-9dd8-4828c45efb03',
    name: 'Koskipanimo'
  }],
  styles: [{
    id: '47cc4475-d9ff-40f0-9ca2-32cd5b978a46',
    name: 'american ipa'
  }]
}
const beerSearchIf = {
  useSearch: () => ({
    search: async () => {
      return [beerSearchResult]
    },
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

const containerId = '50d565d4-49b5-4900-a747-2512e83afe76'
const containerListResult = {
  id: containerId,
  type: 'bottle',
  size: '0.33'
}

const dateStr ='2022-04-01T12:00:00.000Z'
const getCurrentDate = () => new Date(dateStr)
const reviewContainerIf = {
  createIf: {
    useCreate: () => dontCreate
  },
  listIf: {
    useList: () => ({
      data: {
        containers: [containerListResult]
      },
      isLoading: false
    })
  }
}
const storageId = 'be233d3f-b0cc-4d30-8b52-4e1e7fa4fdf9'
const smellText = 'Very nice, caramel, hops'
const tasteText = 'Very good, caramel, malt, bitter'

const dontSelectBeer = {
  create: {
    useCreate: dontCall,
    editBeerIf: {
      selectBreweryIf: {
        create: {
          useCreate: dontCall
        },
        search: {
          useSearch: dontCall
        }
      },
      selectStyleIf: {
        create: {
          useCreate: dontCall
        },
        list: {
          useList: dontCall
        }
      }
    }
  },
  search: {
    useSearch: dontCall
  }
}

const noOpContainerIf = {
  createIf: {
    useCreate: dontCall
  },
  listIf: {
    useList: dontCall
  }
}

const noParamsIf = { useParams: () => ({}) }
const storageIdParamsIf = { useParams: () => ({ storageId }) }

const noSearchIf = { useSearch: dontCall, useDebounce }

const unusedStorageIf = {
  useGet: dontCall
}

const reviewRating = 8

async function addReview(getByPlaceholderText: (
  text: string) => HTMLElement,
  getByRole: (text: string, props?: Record<string, unknown>) => HTMLElement,
  user: UserEvent
) {
  const smellInput = getByPlaceholderText('Smell')
  smellInput.focus()
  userEvent.paste(smellText)
  const tasteInput = getByPlaceholderText('Taste')
  tasteInput.focus()
  await user.paste(tasteText)
  const ratingInput = getByRole('slider')
  ratingInput.click()
  fireEvent.change(ratingInput, {target: {value: `${reviewRating}`}})
  const addButton = getByRole('button', { name: 'Add' })
  expect(addButton.hasAttribute('disabled')).toEqual(false)
  addButton.click()
}

test('adds review', async () => {
  const user = userEvent.setup()
  const create = vitest.fn()
  const props: AddReviewProps = {
    createReviewIf: {
      useCreate: () => ({
        create,
        isLoading: false,
        isSuccess: false,
        review: undefined
      }),
      getCurrentDate,
      selectBeerIf: {
        create: dontCreateBeerIf,
        search: beerSearchIf
      },
      reviewContainerIf
    },
    getStorageIf: unusedStorageIf,
    navigateIf: {
      useNavigate: () => dontCall
    },
    paramsIf: noParamsIf,
    searchIf: {
      useSearch: () => ({
        activate: () => { },
        isActive: true
      }),
      useDebounce
    }
  }
  const { findByRole, getAllByRole, getByPlaceholderText, getByRole } = render(
    <AddReview
      {...props}
    />
  )

  const selects = getAllByRole('radio', { name: 'Select' })
  act(() => selects[0].click())
  const beerSearch = getByPlaceholderText('Search beer')
  expect(beerSearch).toBeDefined()
  beerSearch.focus()
  await user.paste('Seve')
  const beerButton = await findByRole(
    'button',
    { name: 'Severin (Koskipanimo)' }
  )
  expect(beerButton).toBeDefined()
  act(() => beerButton.click())
  const containerSelect = getByRole('combobox')
  act(() => containerSelect.click())
  const bottle = getByRole('option', { name: 'bottle 0.33' })
  userEvent.selectOptions(containerSelect, bottle);
  act(() => bottle.click())
  await addReview(getByPlaceholderText, getByRole, user);
  expect(create.mock.calls).toEqual([[{
    body: {
      additionalInfo: '',
      beer: beerId,
      container: containerId,
      location: '',
      rating: reviewRating,
      smell: smellText,
      taste: tasteText,
      time: dateStr
    },
    storageId: undefined
  }]])
})

test('loads storage', async () => {
  const { getByText } = render(
    <AddReview
      createReviewIf={{
        useCreate: () => ({
          ...dontCreate,
          isSuccess: false,
          review: undefined
        }),
        getCurrentDate,
        selectBeerIf: dontSelectBeer,
        reviewContainerIf: noOpContainerIf
      }}
      getStorageIf={{
        useGet: () => ({
          storage: undefined,
          isLoading: true
        })
      }}
      navigateIf={{
        useNavigate: () => dontCall
      }}
      paramsIf={storageIdParamsIf}
      searchIf={noSearchIf}
    />
  )
  const text = getByText(loadingIndicatorText)
  expect(text).toBeDefined()
})

test('adds review from storage', async () => {
  const user = userEvent.setup()
  const create = vitest.fn()
  const props: AddReviewProps = {
    createReviewIf: {
      useCreate: () => ({
        create,
        isLoading: false,
        isSuccess: false,
        review: undefined
      }),
      getCurrentDate,
      selectBeerIf: {
        create: dontCreateBeerIf,
        search: beerSearchIf
      },
      reviewContainerIf
    },
    getStorageIf: {
      useGet: (storageId: string) => ({
        storage: {
          id: storageId,
          beerId,
          beerName,
          bestBefore: '2024-07-31T12:00:00.000Z',
          breweries: beerSearchResult.breweries,
          container: containerListResult,
          styles: beerSearchResult.styles
        },
        isLoading: false
      })
    },
    navigateIf: {
      useNavigate: () => dontCall
    },
    paramsIf: {
      useParams: () => ({
        storageId
      })
    },
    searchIf: {
      useSearch: () => ({
        activate: () => { },
          isActive: true
      }),
      useDebounce
    }
  }

  const { getByPlaceholderText, getByRole } = render(
    <AddReview
      {...props}
    />
  )
  await addReview(getByPlaceholderText, getByRole, user);

  expect(create.mock.calls).toEqual([[{
    body: {
      additionalInfo: 'From storage, BB 2024-07-31',
      beer: beerId,
      container: containerId,
      location: '',
      rating: reviewRating,
      smell: smellText,
      taste: tasteText,
      time: dateStr
    },
    storageId
  }]])
})

test('navigates', async () => {
  const navigate = vitest.fn()
  const beerId = '7795fabb-a4c4-4e43-b5d0-8b7f01aa906c'
  render(
    <AddReview
      createReviewIf={{
        useCreate: () => ({
          ...dontCreate,
          isSuccess: true,
          review: {
            id: '',
            additionalInfo: '',
            beer: beerId,
            container: '',
            location: '',
            rating: 10,
            smell: '',
            taste: '',
            time: dateStr
          }
        }),
        getCurrentDate,
        selectBeerIf: dontSelectBeer,
        reviewContainerIf: noOpContainerIf
      }}
      getStorageIf={{
        useGet: () => ({
          storage: undefined,
          isLoading: false
        })
      }}
      navigateIf={{
        useNavigate: () => navigate
      }}
      paramsIf={storageIdParamsIf}
      searchIf={noSearchIf}
    />
  )
  expect(navigate.mock.calls).toEqual([[`/beers/${beerId}`]])
})
