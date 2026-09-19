import React from 'react'

import LinkWrapper from '../routing/LinkWrapper'
import { StoreProvider } from '../store/provider'
import RtkApp from './RtkApp'

// The assembled application: the store installed into the component tree, the
// router around it and RtkApp building the interfaces underneath. index.tsx
// only renders this into the document, which keeps the composition a component
// the tests can render as it really is instead of rebuilding the tree
// themselves.
function Root(): React.JSX.Element {
  return (
    <StoreProvider>
      <React.StrictMode>
        <LinkWrapper>
          <RtkApp />
        </LinkWrapper>
      </React.StrictMode>
    </StoreProvider>
  )
}

export default Root
