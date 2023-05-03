import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { store } from './store/store'

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
