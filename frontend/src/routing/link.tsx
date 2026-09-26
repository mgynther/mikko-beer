import React from 'react'

import { Link as RouterLink } from 'react-router'

type LinkComponent = (props: { to: string; text: string }) => React.JSX.Element

export const Link: LinkComponent = (props) => (
  <RouterLink to={props.to}>{props.text}</RouterLink>
)

export default Link
