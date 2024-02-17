import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
