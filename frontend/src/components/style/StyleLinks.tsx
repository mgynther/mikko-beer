import { Links } from '../common/Links'

import type { Style } from '../../core/style/types'

interface Props {
  styles: Style[]
}

export function StyleLinks (props: Props): JSX.Element {
  return (
    <Links
      items={props.styles}
      linkFormatter={(id) => `/styles/${id}`}
    />
  )
}

export default StyleLinks
