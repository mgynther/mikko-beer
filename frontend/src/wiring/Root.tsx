import React, { useState } from 'react'

import LinkWrapper from '../routing/LinkWrapper'
import { createStoreProvider } from '../store/provider'
import type { StoreProviderComponent } from '../store/provider'
import type { WebStorage } from '../store/web-storage'
import StoreApp from './StoreApp'

// The assembled application: the store installed into the component tree, the
// router around it and StoreApp building the interfaces underneath. index.tsx
// only renders this into the document, which keeps the composition a component
// the tests can render as it really is instead of rebuilding the tree
// themselves. The backend url and the storage arrive as props so that a test
// chooses what the application talks to and keeps its state in, rather than
// inheriting what a build is configured with and what the browser holds.
function Root(props: {
  backendUrl: string
  storage: WebStorage
}): React.JSX.Element {
  // Kept in state so that the store is created once per mount, not once per
  // render.
  const [StoreProvider] = useState<StoreProviderComponent>(
    (): StoreProviderComponent =>
      createStoreProvider(props.backendUrl, props.storage),
  )
  return (
    <StoreProvider>
      <React.StrictMode>
        <LinkWrapper>
          <StoreApp />
        </LinkWrapper>
      </React.StrictMode>
    </StoreProvider>
  )
}

export default Root
