import { useListContainersQuery } from '../store/container/api'
import { type Container } from '../store/container/types'

function Containers (): JSX.Element {
  const { data: containerData, isLoading } = useListContainersQuery()
  return (
    <div>
      <h3>Containers</h3>
      {isLoading && (<div>Loading...</div>)}
      <table>
        <tr>
          <th>Type</th>
          <th>Size</th>
        </tr>
        {containerData?.containers.map((container: Container) => (
          <tr key={container.id}>
            <td>{container.type}</td>
            <td>{container.size}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}

export default Containers
