import { expect, test } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UseDebounce } from '../core/types'
import { store } from '../store/store'
import { Provider } from '../react-redux-wrapper'
import search from './search'

const useDebounce: UseDebounce<string> = (str) => [str, false]

function Helper(): React.JSX.Element {
  const searchIf = search(useDebounce)
  const { activate, isActive } = searchIf.useSearch()
  return (
    <div>
      <button onClick={activate}>Activate</button>
      {isActive ? 'Active' : 'Passive'}
    </div>
  )
}

test('activate search', async () => {
  const user = userEvent.setup()
  const { getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>,
  )
  expect(getByText('Passive')).toBeDefined()
  await user.click(getByText('Activate'))
  expect(getByText('Active')).toBeDefined()
})
