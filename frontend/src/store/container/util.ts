import { type Container, type ContainerList, type ContainerMap } from './types'

export function toContainerMap (list: ContainerList | undefined): ContainerMap {
  if (list === undefined) return {}

  const containerMap: Record<string, Container> = {}
  list.containers.forEach(container => {
    containerMap[container.id] = container
  })
  return containerMap
}
