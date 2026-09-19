export interface CreateContainerRequest {
  type: string
  size: string
}

export interface UpdateContainerRequest extends CreateContainerRequest {
  id: string
}
