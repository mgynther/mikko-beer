import { expect, test } from 'vitest'
import { render } from '@testing-library/react'

import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import searchField from './search'

// The id arrives as a function, so the test gives out ids of its own. They
// are constant per field, the way React's useId is constant per component.
function Helper(props: { id: string; label: string }): React.JSX.Element {
  const searchFieldIf = searchField(() => props.id)
  const { activate, isActive } = searchFieldIf.useSearchField()
  return (
    <div>
      <button type='button' onClick={activate}>
        Activate {props.label}
      </button>
      <div>
        {props.label} is {isActive ? 'active' : 'passive'}
      </div>
    </div>
  )
}

test('activate search', async () => {
  const user = setupUser()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <Helper id='the-field' label='The field' />
    </StoreProvider>,
  )
  expect(getByText('The field is passive')).toBeDefined()

  await user.click(getByRole('button', { name: 'Activate The field' }))
  expect(getByText('The field is active')).toBeDefined()
})

test('only the activated search field is active', async () => {
  const user = setupUser()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <Helper id='first-field' label='First' />
      <Helper id='second-field' label='Second' />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Activate Second' }))
  expect(getByText('First is passive')).toBeDefined()
  expect(getByText('Second is active')).toBeDefined()
})
