export interface CreateLocationRequest {
  name: string
}

export interface UpdateLocationRequest extends CreateLocationRequest {
  id: string
}
