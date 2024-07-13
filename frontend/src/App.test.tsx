import { render, screen } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

import { Provider } from './react-redux-wrapper'
import App from './App'
import { store } from './store/store'

vitest.mock('./constants', () => ({
  backendUrl: 'http://localhost:3001'
}))

test('renders app', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  )
  const loginElements = screen.getAllByText(/Login/i)
  expect(loginElements.length).toEqual(2)
  expect(document).toContain(loginElements[0])
})
