import React from 'react'

import { Link as RouterLink } from 'react-router'

// The same shape components/common/link.ts declares. Declared again rather
// than imported so that routing keeps importing no layer at all; the two meet
// in RtkApp, which is where a difference between them becomes a compile error.
type LinkComponent = (props: { to: string; text: string }) => React.JSX.Element

export const Link: LinkComponent = (props) => (
  <RouterLink to={props.to}>{props.text}</RouterLink>
)

export default Link
