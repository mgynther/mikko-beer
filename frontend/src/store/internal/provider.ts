// Installing the store into the component tree is one half of the binding to
// react-redux, reading and dispatching against it is the other, see hooks.ts.
// Together they are the only place react-redux is imported. The problem with
// reduxjs/toolkit is that it replaces a lot of react-redux but does not
// completely wrap it which makes it too easy to accidentally use react-redux
// functionality that has a better reduxjs/toolkit alternative.
export { Provider } from 'react-redux'
