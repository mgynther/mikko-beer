export interface Container {
  id: string
  type: string
  size: string
}

interface ContainerRequest {
  type: string
  size: string
}

export type CreateContainerRequest = ContainerRequest
export type UpdateContainerRequest = ContainerRequest
