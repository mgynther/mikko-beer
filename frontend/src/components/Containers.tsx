import { useListContainersQuery } from '../store/container/api'
import { type Container } from '../store/container/types'

import LoadingIndicator from './LoadingIndicator'

function Containers (): JSX.Element {
  const { data: containerData, isLoading } = useListContainersQuery()

  const containerArray = containerData?.containers === undefined
    ? []
    : [...containerData.containers]
  const containers = containerArray.sort((a, b) => {
    if (a.type === b.type) {
      return parseFloat(a.size) - parseFloat(b.size)
    }
    return a.type.localeCompare(b.type)
  })

  return (
    <div>
      <h3>Containers</h3>
      <LoadingIndicator isLoading={isLoading} />
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {containers.map((container: Container) => (
            <tr key={container.id}>
              <td>{container.type}</td>
              <td>{container.size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Containers
