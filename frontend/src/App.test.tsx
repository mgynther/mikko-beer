import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import LinkWrapper from './components/LinkWrapper'

import { Provider } from './react-redux-wrapper'
import App from './App'
import { store } from './store/store'

test('renders app', () => {
  const { getByRole } = render(
    <Provider store={store}>
      <LinkWrapper>
        <App />
      </LinkWrapper>
    </Provider>
  )
  const loginButton = getByRole('button', { name: 'Login' })
  expect(loginButton).toBeDefined()
})
