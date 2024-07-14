export interface ContainerRequest {
  type: string
  size: string
}

export interface Container {
  id: string
  type: string
  size: string
}

export interface ContainerList {
  containers: Container[]
}

export interface CreateContainerIf {
  create: (container: ContainerRequest) => Promise<Container>
  isLoading: boolean
}

interface ListContainersData {
  data: ContainerList | undefined,
  isLoading: boolean
}

export interface ListContainersIf {
  useList: () => ListContainersData
}

export interface UpdateContainerIf {
  update: (container: Container) => Promise<void>
  isLoading: boolean
}
