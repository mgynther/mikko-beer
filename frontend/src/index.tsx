import ReactDOM from 'react-dom/client'
import { onCLS, onINP, onLCP } from 'web-vitals'

import './index.css'
import Root from './wiring/Root'
import { requireBackendUrl } from './wiring/backend-url'

const rootElement = document.getElementById('root')
if (rootElement === null) throw new Error('Element with id root missing')
const root = ReactDOM.createRoot(rootElement)
// localStorage is shared by every tab, which is what lets a tab use a session
// another tab has refreshed.
root.render(
  <Root
    backendUrl={requireBackendUrl(import.meta.env.VITE_BACKEND_URL)}
    storage={localStorage}
    intersectionObserver={IntersectionObserver}
  />,
)

onCLS(console.log)
onINP(console.log)
onLCP(console.log)
