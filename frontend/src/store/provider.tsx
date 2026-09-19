import { store } from './internal/store'
import { Provider } from './internal/provider'

// The store installed into the component tree. There is one store and every
// caller wants that one, so the public surface is a component that takes the
// tree it wraps and nothing else: which state container is underneath, and
// that it is a redux one at all, stays inside this layer.
export function StoreProvider(props: {
  children: React.ReactNode
}): React.JSX.Element {
  return <Provider store={store}>{props.children}</Provider>
}
