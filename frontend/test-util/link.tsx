import type { LinkComponent } from '../src/components/common/link'

// A link as far as a component test is concerned: the target is rendered, and
// nothing navigates. What clicking one does is routing's business and is
// tested there.
export const testLink: LinkComponent = (props) => (
  <a href={props.to}>{props.text}</a>
)
