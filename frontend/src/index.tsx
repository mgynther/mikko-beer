import React from 'react'
import ReactDOM from 'react-dom/client'
import LinkWrapper from './components/LinkWrapper'
import './index.css'
import RtkApp from './RtkApp'
import {onCLS, onINP, onLCP} from 'web-vitals'

import { Provider } from './react-redux-wrapper'
import { store } from './store/store'

const rootElement = document.getElementById('root')
if (rootElement === null) throw new Error('Element with id root missing')
const root = ReactDOM.createRoot(rootElement)
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <LinkWrapper>
        <RtkApp />
      </LinkWrapper>
    </React.StrictMode>
  </Provider>
)

onCLS(console.log)
onINP(console.log)
onLCP(console.log)
