import { createStore } from './internal/store'
import { Provider } from './internal/provider'
import type { WebStorage } from './web-storage'

export type StoreProviderComponent = (props: {
  children: React.ReactNode
}) => React.JSX.Element

// Creates a store talking to the backend at backendUrl and keeping the session
// and the settings in storage, and gives out the component that installs it
// into the component tree. Every call is a store of its own: the application
// makes one, and each test makes its own so that it starts from nothing
// earlier tests left, with a server and a storage of its own. The public
// surface is the component rather than the store, so which state container is
// underneath, and that it is a redux one at all, stays inside this layer.
export function createStoreProvider(
  backendUrl: string,
  storage: WebStorage,
): StoreProviderComponent {
  const store = createStore(backendUrl, storage)
  return function StoreProvider(props: {
    children: React.ReactNode
  }): React.JSX.Element {
    return <Provider store={store}>{props.children}</Provider>
  }
}
