import { test } from '../test'
import { render } from '../render'

import Root from '../../src/wiring/Root'

test('render root', () => {
  const { getByRole } = render(<Root />)
  getByRole('heading', { name: 'Login' })
})
