import {
  type CreateContainerIf,
  type ListContainersIf
} from "../container/types"

export interface ReviewContainerIf {
  createIf: CreateContainerIf
  listIf: ListContainersIf
}
