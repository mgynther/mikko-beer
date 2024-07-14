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

export interface UpdateContainerIf {
  update: (container: Container) => Promise<void>
  isLoading: boolean
}
