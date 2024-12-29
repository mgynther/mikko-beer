export interface Container {
  id: string
  type: string
  size: string
}

export interface NewContainer {
  type: string
  size: string
}

export interface CreateContainerRequest {
  type: string
  size: string
}

export interface UpdateContainerRequest {
  type: string
  size: string
}
