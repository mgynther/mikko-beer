import type React from 'react'

// How a link is rendered. The components state what they need, routing knows
// how to do it, and the tests hand over a plain anchor.
//
// It is a component and must be rendered as one, never called as a function:
// the real implementation is react-router's Link, which runs hooks of its own,
// and links are rendered inside list mappings where calling it would run those
// hooks in a loop.
export type LinkComponent = (props: {
  to: string
  text: string
}) => React.JSX.Element
