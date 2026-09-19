export interface CreateStyleRequest {
  name: string
  parents: string[]
}

export interface UpdateStyleRequest extends CreateStyleRequest {
  id: string
}
