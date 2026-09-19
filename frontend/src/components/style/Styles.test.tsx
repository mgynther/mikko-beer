import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import { loadingIndicatorText } from '../internal/common/LoadingIndicator'

import Styles from './Styles'
import { setupUser } from '../../../test-util/user-event'
import { dontCall } from '../../../test-util/dont-call'
import { testLink } from '../../../test-util/link'

test('renders styles', () => {
  const { getAllByRole } = render(
    <Styles
      linkComponent={testLink}
      listStylesIf={{
        useList: () => ({
          styles: [
            {
              id: '48f8815e-5968-4863-a152-5693096b75ff',
              name: 'Stout',
              parents: [],
            },
            {
              id: '40b7b0e0-6921-4d0c-9318-9f0d9a703a3d',
              name: 'Porter',
              parents: [],
            },
          ],
          isLoading: false,
        }),
        searchFieldIf: {
          useSearchField: () => ({
            activate: (): void => undefined,
            isActive: false,
          }),
          useDebounce: dontCall,
        },
      }}
      navigateIf={{
        useNavigate: (): (() => void) => () => undefined,
      }}
    />,
  )
  const links = getAllByRole('link')
  expect(links.map((a) => a.innerHTML)).toEqual(['Porter', 'Stout'])
})

test('renders loading text when loading', () => {
  const { getByText } = render(
    <Styles
      linkComponent={testLink}
      listStylesIf={{
        useList: () => ({
          styles: undefined,
          isLoading: true,
        }),
        searchFieldIf: {
          useSearchField: () => ({
            activate: (): void => undefined,
            isActive: false,
          }),
          useDebounce: dontCall,
        },
      }}
      navigateIf={{
        useNavigate: (): (() => void) => () => undefined,
      }}
    />,
  )
  const loadingText = getByText(loadingIndicatorText)
  expect(loadingText).toBeDefined()
})

test('navigates to selected search result', async () => {
  const user = setupUser()
  const navigate = vitest.fn()
  const styleId = '7fdc561f-da68-4665-b888-a82d5a03bf85'
  const { getByPlaceholderText, getByRole } = render(
    <Styles
      linkComponent={testLink}
      listStylesIf={{
        useList: () => ({
          styles: [
            {
              id: styleId,
              name: 'American Lager',
              parents: [],
            },
          ],
          isLoading: false,
        }),
        searchFieldIf: {
          useSearchField: () => ({
            activate: (): void => undefined,
            isActive: true,
          }),
          useDebounce: dontCall,
        },
      }}
      navigateIf={{
        useNavigate: (): (() => void) => navigate,
      }}
    />,
  )
  const searchInput = getByPlaceholderText('Search style')
  await user.type(searchInput, 'Amer')
  const button = getByRole('button', { name: 'American Lager' })
  await user.click(button)
  expect(navigate.mock.calls).toEqual([[`/styles/${styleId}`]])
})
