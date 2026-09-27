import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import CreateBrewery from '../../../../src/components/internal/brewery/CreateBrewery'
import { countryPlaceholder } from '../../../../src/components/internal/brewery/BreweryEditor'
import type {
  CreateBreweryIf,
  CreateBreweryRequest,
} from '../../../../src/components/types/brewery/types'
import { loadingIndicatorText } from '../../../../src/components/internal/common/LoadingIndicator'
import { dontCall } from '../../../dont-call'
import type { Brewery } from '../../../../src/components/types/brewery/types'

const id = '37e1e052-f558-40e1-ae50-4719d2d5f3cc'
const namePlaceholder = 'Create brewery'

test('creates brewery', async () => {
  const user = setupUser()
  const selectBrewery = mockFunction<[brewery: Brewery]>()
  const createBreweryIf: CreateBreweryIf = {
    useCreate: () => ({
      create: async (brewery: CreateBreweryRequest) => ({
        ...brewery,
        id,
      }),
      isLoading: false,
    }),
  }
  const { getByPlaceholderText, getByRole } = render(
    <CreateBrewery select={selectBrewery} createBreweryIf={createBreweryIf} />,
  )
  const createButton = getByRole('button', { name: 'Create' })
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'Salama Brewing')
  assertEqual(createButton.hasAttribute('disabled'), false)
  await user.click(createButton)
  const createCalls = selectBrewery.mock.calls
  assertDeepEqual(createCalls, [
    [
      {
        id,
        name: 'Salama Brewing',
        country: undefined,
      },
    ],
  ])
})

test('render loading', async () => {
  const createBreweryIf: CreateBreweryIf = {
    useCreate: () => ({
      create: dontCall,
      isLoading: true,
    }),
  }
  const { getByText } = render(
    <CreateBrewery select={dontCall} createBreweryIf={createBreweryIf} />,
  )
  getByText(loadingIndicatorText)
})

test('creates brewery with country', async () => {
  const user = setupUser()
  const selectBrewery = mockFunction<[brewery: Brewery]>()
  const createBreweryIf: CreateBreweryIf = {
    useCreate: () => ({
      create: async (brewery: CreateBreweryRequest) => ({
        ...brewery,
        id,
      }),
      isLoading: false,
    }),
  }
  const { getByPlaceholderText, getByRole } = render(
    <CreateBrewery select={selectBrewery} createBreweryIf={createBreweryIf} />,
  )
  const createButton = getByRole('button', { name: 'Create' })
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'Salama Brewing')
  const countryInput = getByPlaceholderText(countryPlaceholder)
  await user.type(countryInput, 'FI')
  assertEqual(createButton.hasAttribute('disabled'), false)
  await user.click(createButton)
  const createCalls = selectBrewery.mock.calls
  assertDeepEqual(createCalls, [
    [
      {
        id,
        name: 'Salama Brewing',
        country: 'FI',
      },
    ],
  ])
})
