import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import './index.css'
import App from './App'
import {onCLS, onINP, onLCP} from 'web-vitals';

import { Provider } from './react-redux-wrapper'
import { store } from './store/store'

const persistor = persistStore(store)
const rootElement = document.getElementById('root')
if (rootElement === null) throw new Error('Element with id root missing')
const root = ReactDOM.createRoot(rootElement)
root.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    </PersistGate>
  </Provider>
)

onCLS(console.log);
onINP(console.log);
onLCP(console.log);
