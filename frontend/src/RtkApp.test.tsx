import { render } from '@testing-library/react'
import { test } from 'vitest'
import { Provider } from './react-redux-wrapper'
import React from 'react'
import LinkWrapper from './components/LinkWrapper'
import RtkApp from './RtkApp'

import { store } from './store/store'

test('render index', () => {
  const { getByRole } = render(
    <Provider store={store}>
      <React.StrictMode>
        <LinkWrapper>
          <RtkApp />
        </LinkWrapper>
      </React.StrictMode>
    </Provider>,
  )
  getByRole('heading', { name: 'Login' })
})
