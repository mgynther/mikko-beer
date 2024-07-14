import { Link } from 'react-router-dom'

import type { Style } from '../../core/style/types'

interface Props {
  styles: Style[]
}

export function StyleLinks (props: Props): JSX.Element {
  return (
    <>
    {[...props.styles]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((style, index) => (
        <span key={style.id}>
          <Link
            to={`/styles/${style.id}`}>{style.name}
          </Link>
          {index < props.styles.length - 1 ? ', ' : ''}
        </span>
      ))
    }
    </>
  )
}

export default StyleLinks
