import { Link } from './Link'

interface Item {
  id: string
  name: string
}

interface Props {
  items: Item[]
  linkFormatter: (id: string) => string
}

export function Links (props: Props): JSX.Element {
  return (
    <>
    {[...props.items]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item, index) => (
        <span key={item.id}>
          <Link
            to={props.linkFormatter(item.id)}
            text={item.name}
          />
          {index < props.items.length - 1 ? ', ' : ''}
        </span>
      ))
    }
    </>
  )
}

export default Links
