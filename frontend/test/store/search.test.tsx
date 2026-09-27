import { test } from '../test'
import { assertDefined } from '../assert'
import { render } from '../render'

import { setupUser } from '../user-event'

import { StoreProvider } from '../../src/store/provider'
import searchField from '../../src/store/search'

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
  assertDefined(getByText('The field is passive'))

  await user.click(getByRole('button', { name: 'Activate The field' }))
  assertDefined(getByText('The field is active'))
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
  assertDefined(getByText('First is passive'))
  assertDefined(getByText('Second is active'))
})
