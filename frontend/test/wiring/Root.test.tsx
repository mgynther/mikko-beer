import { test } from '../test'
import { render } from '../render'
import { createMemoryStorage } from '../memory-storage'
import { createFakeIntersectionObserver } from '../components/fake-intersection-observer'

import Root from '../../src/wiring/Root'

// A host under .invalid never resolves, so the test cannot reach a backend
// whatever a build is configured with. Rendering the login page sends nothing.
const unreachableBackendUrl = 'http://backend.invalid'

test('render root', () => {
  const { getByRole } = render(
    <Root
      backendUrl={unreachableBackendUrl}
      storage={createMemoryStorage()}
      intersectionObserver={
        createFakeIntersectionObserver().IntersectionObserver
      }
    />,
  )
  getByRole('heading', { name: 'Login' })
})
