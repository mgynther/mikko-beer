import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

import { Provider } from './react-redux-wrapper'
import App from './App'
import { store } from './store/store'

test('renders app', () => {
  const { getByRole } = render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  )
  const loginButton = getByRole('button', { name: 'Login' })
  expect(loginButton).toBeDefined()
})
