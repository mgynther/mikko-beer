import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Testing library registers its automatic cleanup when it is first imported.
// Test files share a module registry when the environment is reused so the
// registration only happens for the file that imports it first. Registering
// here makes sure every file unmounts what it rendered.
afterEach(() => {
  cleanup()
})
