import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'

import { Provider } from './react-redux-wrapper'
import App from './App'
import { store } from './store/store'

jest.mock('./constants', () => ({
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
  expect(loginElements[0]).toBeInTheDocument()
})
