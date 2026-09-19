import ReactDOM from 'react-dom/client'
import { onCLS, onINP, onLCP } from 'web-vitals'

import './index.css'
import Root from './wiring/Root'

const rootElement = document.getElementById('root')
if (rootElement === null) throw new Error('Element with id root missing')
const root = ReactDOM.createRoot(rootElement)
root.render(<Root />)

onCLS(console.log)
onINP(console.log)
onLCP(console.log)
